import { setWorkspaceSession } from "@/oauth/session";
import {
  issueAuthCode,
  readClient,
  redirectUriAllowed,
} from "@/oauth/tokens";
import { verifyFonioApiKey } from "@/oauth/verify-key";
import { redirect } from "next/navigation";

export function oauthAuthorizePath(
  fields: Record<string, string>,
  error?: string,
) {
  const params = new URLSearchParams({
    client_id: fields.client_id,
    redirect_uri: fields.redirect_uri,
    state: fields.state,
    code_challenge: fields.code_challenge,
    code_challenge_method: "S256",
  });
  if (error) params.set("error", error);
  return `/oauth/authorize?${params.toString()}`;
}

export async function completeAuthorize(fields: {
  apiKey: string;
  client_id: string;
  redirect_uri: string;
  state: string;
  code_challenge: string;
}) {
  await verifyFonioApiKey(fields.apiKey);
  const client = readClient(fields.client_id);
  if (!redirectUriAllowed(client, fields.redirect_uri)) {
    throw new Error("redirect_uri mismatch");
  }
  await setWorkspaceSession(fields.apiKey);
  const code = issueAuthCode({
    apiKey: fields.apiKey,
    clientId: fields.client_id,
    redirectUri: fields.redirect_uri,
    challenge: fields.code_challenge,
  });
  const target = new URL(fields.redirect_uri);
  target.searchParams.set("code", code);
  if (fields.state) target.searchParams.set("state", fields.state);
  redirect(target.toString());
}
