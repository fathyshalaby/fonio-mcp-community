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
        <div className="relative">
          <p className="text-xs font-medium uppercase tracking-wide text-white/55">
            Open source · not a SaaS · community member
          </p>
          <p className="mt-2 text-lg font-semibold tracking-tight">
            Community MCP for fonio
          </p>
        </div>
        <div className="relative max-w-md">
          <p className="text-3xl font-semibold tracking-tight text-balance">
            Connect a workspace API key
          </p>
          <p className="mt-4 text-base text-white/70 text-pretty">
            This is not a SaaS and not fonio GmbH. Claude, ChatGPT, and Cursor
            use a workspace key from the official app so they can configure
            paste-ready agents and call the documented public API.
          </p>
        </div>
        <p className="relative text-sm text-white/45">
          MIT · not affiliated with fonio GmbH. You log in on{" "}
          {SITE.app.replace("https://", "")} — this volunteer instance never
          asks for your fonio password. No warranty, no liability. Run the repo
          yourself if you do not want an encrypted key stored here.
        </p>
      </aside>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              Unofficial community project
            </p>
            <p className="font-semibold">Community MCP for fonio</p>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Allow this unofficial MCP
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            Official fonio login stays on app.fonio.ai. Paste a workspace API
            key here.
          </p>
          {clientName ? (
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{clientName}</span>{" "}
              wants to search bundled docs, build paste-ready agents, and call
              the public API with your key.
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              After the official login, copy a key from API keys. On a volunteer
              URL the key stays in an encrypted session — unpaid, no warranty.
              Not in the chat.
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
            Unofficial open-source MCP · not a SaaS · authors are not fonio
            employees · MIT · no warranty · no liability for billed calls or
            volunteer hosting · not affiliated with, endorsed by, or sponsored
            by fonio GmbH
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
            {" · "}
            <a href="/legal" className="font-medium text-foreground underline-offset-2 hover:underline">
              Legal
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
