import type { Metadata } from "next";
import { ConnectForm, ConnectShell } from "@/components/connect-form";
import { setWorkspaceSession } from "@/oauth/session";
import { verifyFonioApiKey } from "@/oauth/verify-key";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Connect a workspace key" };

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
    <ConnectShell title="Connect a workspace API key">
      {ok ? (
        <p className="text-sm">
          Key verified on this unofficial community host. Add this site’s{" "}
          <code className="rounded bg-muted px-1">/mcp</code> URL in Claude,
          ChatGPT, or Cursor. They open this community connector (not fonio
          GmbH OAuth): log in at app.fonio.ai, then reuse the encrypted
          session so you do not paste the key into chat.
        </p>
      ) : (
        <ConnectForm action={connect} error={error} />
      )}
    </ConnectShell>
  );
}
