import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

function secret(): string {
  const value = process.env.FONIO_MCP_SECRET?.trim();
  if (value && value.length >= 16) return value;
  if (!process.env.FONIO_MCP_SECRET_FALLBACK) {
    process.env.FONIO_MCP_SECRET_FALLBACK = randomBytes(32).toString("hex");
  }
  return process.env.FONIO_MCP_SECRET_FALLBACK;
}

function keyBytes(): Buffer {
  return createHash("sha256").update(secret()).digest();
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyBytes(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64url");
}

export function decryptSecret(packed: string): string {
  const buf = Buffer.from(packed, "base64url");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", keyBytes(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

export type SignedToken<T> = {
  v: 1;
  t: "client" | "code" | "access" | "session" | "confirmation";
  exp: number;
  d: T;
};

export function signToken<T>(
  type: SignedToken<T>["t"],
  data: T,
  ttlSeconds: number,
): string {
  const payload: SignedToken<T> = {
    v: 1,
    t: type,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    d: data,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken<T>(type: SignedToken<T>["t"], token: string): T {
  const [body, sig] = token.split(".");
  if (!body || !sig) throw new Error("Malformed token");
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Invalid token signature");
  }
  const payload = JSON.parse(
    Buffer.from(body, "base64url").toString("utf8"),
  ) as SignedToken<T>;
  if (payload.v !== 1 || payload.t !== type) {
    throw new Error("Unexpected token type");
  }
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }
  return payload.d;
}

export type ClientRecord = {
  name: string;
  redirectUris: string[];
};

export type AuthCodeRecord = {
  apiKey: string;
  clientId: string;
  redirectUri: string;
  challenge: string;
};

export type AccessRecord = {
  apiKey: string;
  clientId: string;
};

export type WorkspaceSession = {
  apiKey: string;
  fingerprint: string;
};

export type OutboundConfirmation = {
  fromNumber: string;
  toNumber: string;
};

const consumedTokens = new Map<string, number>();

function consumeOnce(token: string, expiresAt: number): void {
  const now = Date.now();
  for (const [value, expiry] of consumedTokens) {
    if (expiry <= now) consumedTokens.delete(value);
  }
  if (consumedTokens.has(token)) throw new Error("Confirmation token already used");
  consumedTokens.set(token, expiresAt * 1000);
}

export function fingerprintKey(apiKey: string): string {
  return apiKey.trim().slice(-4);
}

export function issueWorkspaceCookieValue(apiKey: string): string {
  return signToken(
    "session",
    {
      apiKey: encryptSecret(apiKey),
      fingerprint: fingerprintKey(apiKey),
    },
    60 * 60 * 24 * 30,
  );
}

export function readWorkspaceCookieValue(token: string): WorkspaceSession {
  const data = verifyToken<{ apiKey: string; fingerprint: string }>(
    "session",
    token,
  );
  return {
    apiKey: decryptSecret(data.apiKey),
    fingerprint: data.fingerprint,
  };
}

export function issueClientId(record: ClientRecord): string {
  return signToken("client", record, 60 * 60 * 24 * 365);
}

export function readClient(clientId: string): ClientRecord {
  return verifyToken<ClientRecord>("client", clientId);
}

export function issueAuthCode(record: AuthCodeRecord): string {
  return signToken(
    "code",
    { ...record, apiKey: encryptSecret(record.apiKey) },
    10 * 60,
  );
}

export function readAuthCode(code: string): AuthCodeRecord {
  const data = verifyToken<AuthCodeRecord & { apiKey: string }>("code", code);
  return { ...data, apiKey: decryptSecret(data.apiKey) };
}

export function consumeAuthCode(code: string): AuthCodeRecord {
  const issued = readAuthCode(code);
  consumeOnce(code, Math.floor(Date.now() / 1000) + 10 * 60);
  return issued;
}

export function issueAccessToken(record: AccessRecord): string {
  return signToken(
    "access",
    { ...record, apiKey: encryptSecret(record.apiKey) },
    60 * 60 * 24 * 30,
  );
}

export function readAccessToken(token: string): AccessRecord {
  const data = verifyToken<AccessRecord & { apiKey: string }>("access", token);
  return { ...data, apiKey: decryptSecret(data.apiKey) };
}

export function issueOutboundConfirmation(record: OutboundConfirmation): string {
  return signToken("confirmation", record, 5 * 60);
}

export function consumeOutboundConfirmation(token: string): OutboundConfirmation {
  const confirmation = verifyToken<OutboundConfirmation>("confirmation", token);
  consumeOnce(token, Math.floor(Date.now() / 1000) + 5 * 60);
  return confirmation;
}

export function pkceS256(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function redirectUriAllowed(record: ClientRecord, uri: string): boolean {
  if (record.redirectUris.includes(uri)) return true;
  try {
    const parsed = new URL(uri);
    if (parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost") {
      return record.redirectUris.some((allowed) => {
        try {
          const other = new URL(allowed);
          return other.hostname === "127.0.0.1" || other.hostname === "localhost";
        } catch {
          return false;
        }
      });
    }
  } catch {
    return false;
  }
  return false;
}
