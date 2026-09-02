"use server";

import { completeAuthorize, oauthAuthorizePath } from "@/oauth/complete";
import {
  clearWorkspaceSession,
  getWorkspaceSession,
} from "@/oauth/session";
import { redirect } from "next/navigation";

function fieldsFromForm(formData: FormData) {
  return {
    client_id: String(formData.get("client_id") ?? ""),
    redirect_uri: String(formData.get("redirect_uri") ?? ""),
    state: String(formData.get("state") ?? ""),
    code_challenge: String(formData.get("code_challenge") ?? ""),
  };
}

export async function connectWorkspace(formData: FormData) {
  const fields = fieldsFromForm(formData);
  try {
    await completeAuthorize({
      ...fields,
      apiKey: String(formData.get("apiKey") ?? ""),
    });
  } catch (err) {
    if (typeof err === "object" && err && "digest" in err) throw err;
    const message = err instanceof Error ? err.message : "Could not connect";
    redirect(oauthAuthorizePath(fields, message));
  }
}

export async function continueWorkspaceSession(formData: FormData) {
  const fields = fieldsFromForm(formData);
  try {
    const current = await getWorkspaceSession();
    if (!current) {
      throw new Error("Session expired. Paste a workspace API key again.");
    }
    await completeAuthorize({ ...fields, apiKey: current.apiKey });
  } catch (err) {
    if (typeof err === "object" && err && "digest" in err) throw err;
    await clearWorkspaceSession();
    const message = err instanceof Error ? err.message : "Could not continue";
    redirect(oauthAuthorizePath(fields, message));
  }
}

export async function switchWorkspace(formData: FormData) {
  await clearWorkspaceSession();
  redirect(oauthAuthorizePath(fieldsFromForm(formData)));
}
