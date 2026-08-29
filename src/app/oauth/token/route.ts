import { NextResponse } from "next/server";
import {
  issueAccessToken,
  pkceS256,
  readAuthCode,
  readClient,
  redirectUriAllowed,
} from "@/oauth/tokens";

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(request: Request) {
  const cors = { "Access-Control-Allow-Origin": "*" };
  const form = await request.formData().catch(() => null);
  const json = form ? null : ((await request.json().catch(() => ({}))) as Record<string, string>);
  const get = (key: string) =>
    (form ? String(form.get(key) ?? "") : json?.[key] ?? "").toString();

  const grant = get("grant_type");
  if (grant !== "authorization_code") {
    return NextResponse.json(
      { error: "unsupported_grant_type" },
      { status: 400, headers: cors },
    );
  }

  const code = get("code");
  const verifier = get("code_verifier");
  const redirectUri = get("redirect_uri");
  const clientId = get("client_id");

  try {
    const issued = readAuthCode(code);
    if (clientId && issued.clientId !== clientId) {
      throw new Error("client_id mismatch");
    }
    if (issued.redirectUri !== redirectUri) {
      throw new Error("redirect_uri mismatch");
    }
    const client = readClient(issued.clientId);
    if (!redirectUriAllowed(client, redirectUri)) {
      throw new Error("redirect_uri not registered");
    }
    if (pkceS256(verifier) !== issued.challenge) {
      throw new Error("PKCE verification failed");
    }
    const accessToken = issueAccessToken({
      apiKey: issued.apiKey,
      clientId: issued.clientId,
    });
    return NextResponse.json(
      {
        access_token: accessToken,
        token_type: "bearer",
        expires_in: 60 * 60 * 24 * 30,
        scope: "fonio",
      },
      { headers: { ...cors, "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid_grant";
    return NextResponse.json(
      { error: "invalid_grant", error_description: message },
      { status: 400, headers: cors },
    );
  }
}
