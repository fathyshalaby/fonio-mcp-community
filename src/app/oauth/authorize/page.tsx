import { ConnectForm, ResumeSessionForm } from "@/components/connect-form";
import { FonioAuthShell } from "@/components/fonio-auth-shell";
import {
  connectWorkspace,
  continueWorkspaceSession,
  switchWorkspace,
} from "@/app/oauth/authorize/actions";
import { getWorkspaceSession } from "@/oauth/session";
import { readClient, redirectUriAllowed } from "@/oauth/tokens";

export const metadata = { title: "Sign in with fonio · community connector" };

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

  const hiddenFields = {
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    code_challenge: challenge,
  };

  let clientName = "This assistant";
  let invalid = "";
  try {
    if (!clientId || !redirectUri || !challenge) {
      invalid =
        "This connect link is missing OAuth parameters. Add the MCP URL in Claude, ChatGPT, or Cursor — they open this page for you.";
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
    invalid =
      "Unknown or expired client. Remove the connector and add the MCP URL again.";
  }

  const session = invalid ? null : await getWorkspaceSession();

  return (
    <FonioAuthShell clientName={invalid ? undefined : clientName}>
      {invalid ? (
        <p className="text-sm text-muted-foreground">{invalid}</p>
      ) : session && !error ? (
        <ResumeSessionForm
          action={continueWorkspaceSession}
          switchAction={switchWorkspace}
          hiddenFields={hiddenFields}
          fingerprint={session.fingerprint}
          clientName={clientName}
        />
      ) : (
        <ConnectForm
          action={connectWorkspace}
          error={error}
          hiddenFields={hiddenFields}
          submitLabel="Allow access"
        />
      )}
    </FonioAuthShell>
  );
}
