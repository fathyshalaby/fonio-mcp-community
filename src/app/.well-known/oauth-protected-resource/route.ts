import { NextResponse } from "next/server";
import { mcpResourceUrl, publicOrigin } from "@/lib/origin";

function corsJson(body: unknown) {
  return NextResponse.json(body, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, mcp-protocol-version",
      "Cache-Control": "no-store",
    },
  });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, mcp-protocol-version",
    },
  });
}

export function GET(request: Request) {
  const origin = publicOrigin(request);
  return corsJson({
    resource: mcpResourceUrl(request),
    authorization_servers: [origin],
    bearer_methods_supported: ["header"],
    scopes_supported: ["fonio"],
    resource_name: "Unofficial community MCP for fonio (not fonio GmbH)",
  });
}
