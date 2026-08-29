import { ConnectForm, ConnectShell } from "@/components/connect-form";
import {
  issueAuthCode,
  readClient,
  redirectUriAllowed,
} from "@/oauth/tokens";
import { verifyFonioApiKey } from "@/oauth/verify-key";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function AuthorizePage({ searchParams }: Props) {
  const params = await searchParams;
  const clientId = first(params.client_id);
  const redirectUri = first(params.redirect_uri);
  const state = first(params.state);
  const challenge = first(params.code_challenge);
  const method = first(params.code_challenge_method) || "S256";
  const error = first(params.error);

  let clientName = "This assistant";
  let invalid = "";
  try {
    if (!clientId || !redirectUri || !challenge) {
      invalid = "This connect link is missing OAuth parameters. Add the MCP URL in Claude, ChatGPT, or Cursor — they open this page for you.";
    } else if (method !== "S256") {
      invalid = "Only PKCE S256 is supported.";
    } else {
      const client = readClient(clientId);
      clientName = client.name;
      if (!redirectUriAllowed(client, redirectUri)) {
        invalid = "This redirect URI is not registered for the client.";
      }
    }
  } catch {
    invalid = "Unknown or expired client. Remove the connector and add the MCP URL again.";
  }

  async function connect(formData: FormData) {
    "use server";
    const apiKey = String(formData.get("apiKey") ?? "");
    const cid = String(formData.get("client_id") ?? "");
    const ru = String(formData.get("redirect_uri") ?? "");
    const st = String(formData.get("state") ?? "");
    const cc = String(formData.get("code_challenge") ?? "");
    try {
      await verifyFonioApiKey(apiKey);
      const client = readClient(cid);
      if (!redirectUriAllowed(client, ru)) {
        throw new Error("redirect_uri mismatch");
      }
      const code = issueAuthCode({
        apiKey,
        clientId: cid,
        redirectUri: ru,
        challenge: cc,
      });
      const target = new URL(ru);
      target.searchParams.set("code", code);
      if (st) target.searchParams.set("state", st);
      redirect(target.toString());
    } catch (err) {
      if (typeof err === "object" && err && "digest" in err) throw err;
      const message = err instanceof Error ? err.message : "Could not connect";
      const back = new URLSearchParams({
        client_id: cid,
        redirect_uri: ru,
        state: st,
        code_challenge: cc,
        code_challenge_method: "S256",
        error: message,
      });
      redirect(`/oauth/authorize?${back.toString()}`);
    }
  }

  return (
    <ConnectShell title="Sign in with fonio" clientName={invalid ? undefined : clientName}>
      {invalid ? (
        <p className="text-sm text-muted-foreground">{invalid}</p>
      ) : (
        <ConnectForm
          action={connect}
          error={error}
          hiddenFields={{
            client_id: clientId,
            redirect_uri: redirectUri,
            state,
            code_challenge: challenge,
          }}
          submitLabel="Allow access"
        />
      )}
    </ConnectShell>
  );
}
