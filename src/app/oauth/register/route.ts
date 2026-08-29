import { NextResponse } from "next/server";
import { issueClientId } from "@/oauth/tokens";

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, mcp-protocol-version",
    },
  });
}

export async function POST(request: Request) {
  let body: {
    client_name?: string;
    redirect_uris?: string[];
    token_endpoint_auth_method?: string;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const redirectUris = (body.redirect_uris ?? []).filter(
    (uri) => typeof uri === "string" && uri.length > 0,
  );
  if (redirectUris.length === 0) {
    return NextResponse.json(
      { error: "invalid_client_metadata", error_description: "redirect_uris required" },
      { status: 400, headers: { "Access-Control-Allow-Origin": "*" } },
    );
  }

  const clientId = issueClientId({
    name: body.client_name?.trim() || "MCP client",
    redirectUris,
  });

  return NextResponse.json(
    {
      client_id: clientId,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      client_name: body.client_name?.trim() || "MCP client",
      redirect_uris: redirectUris,
      grant_types: ["authorization_code"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    },
    {
      status: 201,
      headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" },
    },
  );
}
