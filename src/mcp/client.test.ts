import { describe, expect, it, vi } from "vitest";
import {
  assertE164,
  assertConfirmedDestination,
  FonioApiError,
  FonioClient,
  normalizePhoneNumber,
} from "@/mcp/client";
import { getArticle, listArticles, searchDocs } from "@/mcp/docs";

describe("normalizePhoneNumber", () => {
  it("strips spaces and converts 00 prefix", () => {
    expect(normalizePhoneNumber("00 43 1 234 567")).toBe("+431234567");
    expect(normalizePhoneNumber("+43 (1) 234-567")).toBe("+431234567");
  });
});

describe("assertE164", () => {
  it("accepts valid E.164 numbers", () => {
    expect(assertE164("toNumber", "+43123456789")).toBe("+43123456789");
  });

  it("rejects missing plus", () => {
    expect(() => assertE164("toNumber", "43123456789")).toThrow(/international format/);
  });
});

describe("assertConfirmedDestination", () => {
  it("requires the confirmed number to match the destination", () => {
    expect(
      assertConfirmedDestination("+43123456789", "+43 1 234 567 89"),
    ).toBe("+43123456789");
    expect(() =>
      assertConfirmedDestination("+43123456789", "+4915123456789"),
    ).toThrow(/Confirmation guard failed/);
  });
});

describe("docs catalog", () => {
  it("lists every article with a slug and body", () => {
    const listed = listArticles();
    expect(listed.length).toBeGreaterThan(8);
    for (const item of listed) {
      const article = getArticle(item.slug);
      expect(article?.body.length).toBeGreaterThan(80);
    }
  });

  it("finds outbound API guidance", () => {
    const hits = searchDocs("trigger outbound call fromNumber context");
    expect(hits[0]?.slug).toMatch(/outbound/);
  });

  it("finds inbound webhook context", () => {
    const hits = searchDocs("inbound webhook inboundContext");
    expect(hits.some((hit) => hit.slug === "api-webhooks")).toBe(true);
  });

  it("returns empty for nonsense", () => {
    expect(searchDocs("zzzzqxq-no-such-term")).toEqual([]);
  });
});

describe("FonioClient", () => {
  it("sends Bearer auth and JSON body", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ status: "success", message: "ok" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const client = new FonioClient("test-key", "https://app.fonio.ai/api", fetchImpl);
    const result = await client.triggerOutboundCall({
      fromNumber: "+43123456789",
      toNumber: "+4915123456789",
      context: { name: "Ada" },
    });
    expect(result.status).toBe("success");
    expect(fetchImpl).toHaveBeenCalledOnce();
    const call = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    const url = call[0];
    const init = call[1];
    expect(url).toBe("https://app.fonio.ai/api/public/v1/outbound_call");
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer test-key",
    );
    expect(JSON.parse(String(init.body))).toEqual({
      fromNumber: "+43123456789",
      toNumber: "+4915123456789",
      context: { name: "Ada" },
    });
  });

  it("wraps HTTP errors", async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ message: "unauthorized" }), { status: 401 }),
    );
    const client = new FonioClient("bad", "https://app.fonio.ai/api", fetchImpl);
    await expect(client.testApiKey()).rejects.toBeInstanceOf(FonioApiError);
  });
});
