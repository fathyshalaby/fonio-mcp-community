import type { Metadata } from "next";
import { ConnectForm, ConnectShell } from "@/components/connect-form";
import { setWorkspaceSession } from "@/oauth/session";
import { verifyFonioApiKey } from "@/oauth/verify-key";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Connect" };

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;

  async function connect(formData: FormData) {
    "use server";
    const apiKey = String(formData.get("apiKey") ?? "");
    try {
      await verifyFonioApiKey(apiKey);
      await setWorkspaceSession(apiKey);
      redirect("/connect?ok=1");
    } catch (err) {
      if (typeof err === "object" && err && "digest" in err) throw err;
      const message = err instanceof Error ? err.message : "Could not verify key";
      redirect(`/connect?error=${encodeURIComponent(message)}`);
    }
  }

  return (
    <ConnectShell title="Connect your fonio workspace">
      {ok ? (
        <p className="text-sm">
          Signed in. Add this site’s{" "}
          <code className="rounded bg-muted px-1">/mcp</code> URL in Claude, ChatGPT,
          or Cursor — they open <strong>Sign in with fonio</strong> (the official
          login at app.fonio.ai) and reuse this encrypted session so you do not
          paste the key into chat.
        </p>
      ) : (
        <ConnectForm action={connect} error={error} submitLabel="Verify with fonio" />
      )}
    </ConnectShell>
  );
}
