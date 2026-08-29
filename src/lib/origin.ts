export function publicOrigin(request?: Request): string {
  return originFromHeaders(request?.headers);
}

export function originFromHeaders(h?: Headers | { get(name: string): string | null }): string {
  const fromEnv = process.env.NEXT_PUBLIC_MCP_ORIGIN?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (h) {
    const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").split(",")[0]!.trim();
    if (host) {
      const proto = (
        h.get("x-forwarded-proto") ??
        (host.includes("localhost") || host.startsWith("127.") ? "http" : "https")
      )
        .split(",")[0]!
        .trim();
      return `${proto}://${host}`;
    }
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  return "http://127.0.0.1:43147";
}

export function mcpResourceUrl(request?: Request): string {
  return `${publicOrigin(request)}/mcp`;
}
