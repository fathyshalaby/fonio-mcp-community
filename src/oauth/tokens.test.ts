import { describe, expect, it } from "vitest";
import {
  issueAccessToken,
  issueAuthCode,
  issueClientId,
  issueOutboundConfirmation,
  consumeAuthCode,
  consumeOutboundConfirmation,
  issueWorkspaceCookieValue,
  pkceS256,
  readAccessToken,
  readAuthCode,
  readClient,
  readWorkspaceCookieValue,
  redirectUriAllowed,
} from "@/oauth/tokens";

describe("oauth tokens", () => {
  it("round-trips a client and access token", () => {
    const clientId = issueClientId({
      name: "Claude",
      redirectUris: ["https://claude.ai/api/mcp/auth_callback"],
    });
    const client = readClient(clientId);
    expect(client.name).toBe("Claude");
    const access = issueAccessToken({ apiKey: "secret-key", clientId });
    expect(readAccessToken(access).apiKey).toBe("secret-key");
  });

  it("verifies PKCE S256 on an auth code", () => {
    const verifier = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUV";
    const clientId = issueClientId({
      name: "test",
      redirectUris: ["http://127.0.0.1:9/cb"],
    });
    const code = issueAuthCode({
      apiKey: "k",
      clientId,
      redirectUri: "http://127.0.0.1:9/cb",
      challenge: pkceS256(verifier),
    });
    const issued = readAuthCode(code);
    expect(issued.apiKey).toBe("k");
    expect(pkceS256(verifier)).toBe(issued.challenge);
  });

  it("consumes authorization and outbound confirmation tokens once", () => {
    const clientId = issueClientId({
      name: "test",
      redirectUris: ["http://127.0.0.1:9/cb"],
    });
    const code = issueAuthCode({
      apiKey: "k",
      clientId,
      redirectUri: "http://127.0.0.1:9/cb",
      challenge: "challenge",
    });
    expect(consumeAuthCode(code).apiKey).toBe("k");
    expect(() => consumeAuthCode(code)).toThrow(/already used/);

    const confirmation = issueOutboundConfirmation({
      fromNumber: "+43123456789",
      toNumber: "+4915123456789",
    });
    expect(consumeOutboundConfirmation(confirmation).toNumber).toBe(
      "+4915123456789",
    );
    expect(() => consumeOutboundConfirmation(confirmation)).toThrow(/already used/);
  });

  it("round-trips an encrypted workspace session cookie value", () => {
    const packed = issueWorkspaceCookieValue("sk_live_workspace_9f3a");
    const session = readWorkspaceCookieValue(packed);
    expect(session.apiKey).toBe("sk_live_workspace_9f3a");
    expect(session.fingerprint).toBe("9f3a");
  });

  it("allows any localhost redirect once a localhost URI was registered", () => {
    const client = {
      name: "cli",
      redirectUris: ["http://127.0.0.1:54321/callback"],
    };
    expect(redirectUriAllowed(client, "http://127.0.0.1:9999/callback")).toBe(true);
    expect(
      redirectUriAllowed(client, "https://claude.ai/api/mcp/auth_callback"),
    ).toBe(false);
  });
});
