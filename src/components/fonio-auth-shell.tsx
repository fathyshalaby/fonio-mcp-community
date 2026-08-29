import { FonioMark } from "@/components/fonio-mark";
import { SITE } from "@/lib/site";

export function FonioAuthShell({
  children,
  clientName,
  error,
}: {
  children: React.ReactNode;
  clientName?: string;
  error?: string;
}) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-[#0f0f16] px-12 py-16 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(88,93,254,0.35),transparent_55%)]" />
        <div className="relative flex items-center gap-3">
          <FonioMark className="size-10 text-primary" />
          <span className="text-lg font-semibold tracking-tight">fonio MCP</span>
        </div>
        <div className="relative max-w-md">
          <p className="text-3xl font-semibold tracking-tight text-balance">Connect a workspace</p>
          <p className="mt-4 text-base text-white/70 text-pretty">
            This independent community connector lets Claude, ChatGPT, and Cursor
            search Fonio docs and use the public API in your workspace.
          </p>
        </div>
        <p className="relative text-sm text-white/45">
          Unofficial project · MIT · not affiliated with fonio GmbH. You log in on{" "}
          {SITE.app.replace("https://", "")} — we never ask for your fonio password.
        </p>
      </aside>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <FonioMark className="size-9 text-primary" />
            <span className="font-semibold">fonio MCP</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Connect with fonio</h1>
          <p className="mt-1 text-base text-muted-foreground">
            Log in to continue
          </p>
          {clientName ? (
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{clientName}</span>{" "}
              wants permission to search fonio docs and place outbound calls as
              your workspace.
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Continue on fonio, then allow this assistant. Your workspace key
              stays in an encrypted session — not in the chat.
            </p>
          )}
          {error ? (
            <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <div className="mt-6 rounded-2xl border bg-card p-5 shadow-sm">
            {children}
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Unofficial community MCP · MIT · no warranty · no liability for billed calls ·
            not affiliated with, endorsed by, or sponsored by fonio GmbH
            <br />
            Official app:{" "}
            <a
              href={SITE.login}
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              app.fonio.ai
            </a>
            {" · "}
            <a
              href={SITE.apiKeys}
              className="font-medium text-foreground underline-offset-2 hover:underline"
            >
              API keys
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
