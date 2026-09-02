import { describe, expect, it } from "vitest";
import { AUTH_REQUIRED_MESSAGE, NO_OFFICIAL_MCP } from "@/lib/legal";
import { connectionSnapshot } from "@/mcp/register";
import { SERVER_NAME } from "@/mcp/version";
import { SITE } from "@/lib/site";

describe("unofficial naming", () => {
  it("is named unofficial-fonio-mcp, not fonio MCP", () => {
    expect(SERVER_NAME).toBe("unofficial-fonio-mcp");
    expect(SITE.name).toBe("Unofficial fonio MCP");
    expect(NO_OFFICIAL_MCP).toMatch(/no official fonio MCP/i);
    expect(NO_OFFICIAL_MCP).toMatch(/registry/);
  });
});

describe("connectionSnapshot", () => {
  it("reports disconnected without a key", () => {
    const status = connectionSnapshot(undefined, false);
    expect(status.connected).toBe(false);
    expect(status.source).toBe("none");
    expect(status.keyFingerprint).toBeNull();
    if (!status.connected) {
      expect(status.next).toBe(AUTH_REQUIRED_MESSAGE);
      expect(status.next).not.toMatch(/Sign in with fonio/i);
    }
  });

  it("fingerprints an OAuth session key without echoing it", () => {
    const status = connectionSnapshot(
      {
        http: {
          authInfo: { extra: { apiKey: "sk_live_workspace_9f3a" } },
        },
      } as never,
      false,
    );
    expect(status.connected).toBe(true);
    expect(status.source).toBe("community_mcp_oauth");
    expect(status.keyFingerprint).toBe("9f3a");
    expect(JSON.stringify(status)).not.toContain("sk_live_workspace_9f3a");
  });
});
