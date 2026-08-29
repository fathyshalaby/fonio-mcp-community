import { describe, expect, it } from "vitest";
import {
  issueAccessToken,
  issueAuthCode,
  issueClientId,
  pkceS256,
  readAccessToken,
  readAuthCode,
  readClient,
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
