import { DEFAULT_API_BASE_URL } from "./version";

const E164_RE = /^\+[1-9]\d{1,14}$/;
const FONIO_NUMBER_RE = /^\+\d+$/;
const UUID_RE =
  /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;

export class FonioApiError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = "FonioApiError";
    this.status = status;
    this.body = body;
  }
}

export type OutboundCallInput = {
  fromNumber: string;
  toNumber: string;
  context?: Record<string, unknown>;
};

export type FonioStatusResponse = {
  status: "success" | "error";
  message: string;
};

export type RemoteServer = {
  id: string;
  baseUrl: string;
};

export type SaveRemoteServerInput = {
  baseUrl: string;
  authToken: string;
};

export function normalizePhoneNumber(value: string): string {
  const trimmed = value.trim().replace(/[\s()-]/g, "");
  if (trimmed.startsWith("00")) {
    return `+${trimmed.slice(2)}`;
  }
  return trimmed;
}

export function assertE164(label: string, value: string): string {
  const normalized = normalizePhoneNumber(value);
  if (!FONIO_NUMBER_RE.test(normalized)) {
    throw new Error(
      `${label} must be in international format starting with +, e.g. +43123456789. Received: ${value}`,
    );
  }
  if (!E164_RE.test(normalized)) {
    throw new Error(
      `${label} looks invalid. Use E.164 (plus sign, country code, subscriber number, 8–15 digits). Received: ${value}`,
    );
  }
  return normalized;
}

export function assertConfirmedDestination(
  toNumber: string,
  confirmedToNumber: string,
): string {
  const normalizedToNumber = assertE164("toNumber", toNumber);
  const normalizedConfirmation = assertE164(
    "confirmedToNumber",
    confirmedToNumber,
  );
  if (normalizedConfirmation !== normalizedToNumber) {
    throw new Error(
      "Confirmation guard failed. Ask the user to confirm the exact destination number, then repeat that number in confirmedToNumber.",
    );
  }
  return normalizedToNumber;
}

export function assertHttpsUrl(label: string, value: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value.trim());
  } catch {
    throw new Error(`${label} must be an absolute URL. Received: ${value}`);
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(`${label} must be http(s). Received: ${value}`);
  }
  return parsed.toString().replace(/\/$/, "");
}

export function assertUuid(label: string, value: string): string {
  const id = value.trim();
  if (!UUID_RE.test(id)) {
    throw new Error(`${label} must be the UUID returned by list_remote_integration_servers.`);
  }
  return id;
}

export function getApiKey(): string | undefined {
  const fromEnv = process.env.FONIO_API_KEY?.trim();
  return fromEnv || undefined;
}

export function getBaseUrl(): string {
  return DEFAULT_API_BASE_URL;
}

export class FonioClient {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl = getBaseUrl(),
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async testApiKey(): Promise<FonioStatusResponse> {
    return this.request<FonioStatusResponse>("POST", "/public/v1/test-api-key", {});
  }

  async triggerOutboundCall(
    input: OutboundCallInput,
  ): Promise<FonioStatusResponse> {
    const fromNumber = assertE164("fromNumber", input.fromNumber);
    const toNumber = assertE164("toNumber", input.toNumber);
    return this.request<FonioStatusResponse>("POST", "/public/v1/outbound_call", {
      fromNumber,
      toNumber,
      ...(input.context && Object.keys(input.context).length > 0
        ? { context: input.context }
        : {}),
    });
  }

  async listRemoteIntegrationServers(): Promise<RemoteServer[]> {
    return this.request<RemoteServer[]>("GET", "/integrations/remote-registry/servers");
  }

  async registerRemoteIntegrationServer(
    input: SaveRemoteServerInput,
  ): Promise<{ baseUrl: string }> {
    const baseUrl = assertHttpsUrl("baseUrl", input.baseUrl);
    const authToken = input.authToken.trim();
    if (authToken.length < 1 || authToken.length > 512) {
      throw new Error("authToken must be 1–512 characters.");
    }
    return this.request<{ baseUrl: string }>(
      "PUT",
      "/integrations/remote-registry/servers",
      { baseUrl, authToken },
    );
  }

  async deleteRemoteIntegrationServer(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(
      "DELETE",
      "/integrations/remote-registry/servers",
      { id: assertUuid("id", id) },
    );
  }

  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: "application/json",
      "User-Agent": "fonio-community-mcp/1.2",
    };
    let payload: string | undefined;
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method,
        headers,
        body: payload,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new FonioApiError(
        `Could not reach the fonio API at ${url}: ${message}`,
        0,
        "",
      );
    }

    const text = await response.text();
    let parsed: unknown = text;
    if (text) {
      try {
        parsed = JSON.parse(text) as unknown;
      } catch {
        parsed = text;
      }
    }

    if (!response.ok) {
      const detail =
        typeof parsed === "object" && parsed !== null
          ? JSON.stringify(parsed)
          : text;
      throw new FonioApiError(
        `fonio API ${path} failed (${response.status}): ${detail || response.statusText}`,
        response.status,
        text,
      );
    }

    return parsed as T;
  }
}
