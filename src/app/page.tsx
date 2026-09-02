import Link from "next/link";
import { ArrowRight, BookOpen, KeyRound, PhoneCall, Shield } from "lucide-react";
import { DocsSearch } from "@/components/docs-search";
import { InstallPanel } from "@/components/install-panel";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { headers } from "next/headers";
import { originFromHeaders } from "@/lib/origin";
import { EXAMPLES } from "@/lib/examples";
import { PROMPTS, TOOLS } from "@/lib/site";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const origin = originFromHeaders(await headers());

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(88,93,254,0.18),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(191,239,242,0.55),transparent_45%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
          <div>
            <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/10">
              Unofficial · community member · MIT
            </Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Build fonio agents in Claude, ChatGPT, and Cursor.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground text-pretty">
              Independent community MCP for fonio.ai — not fonio GmbH, not
              staff. Connect with a workspace API key, then configure a full
              paste-ready voice or WhatsApp agent in chat. Live API calls need
              that key. Prefer self-hosting so this operator never holds it.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="#install" className={cn(buttonVariants({ size: "lg" }), "h-10 px-4")}>
                Connect a client
                <ArrowRight />
              </Link>
              <Link
                href="/examples"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-10 px-4")}
              >
                See examples
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Add the hosted <code className="rounded bg-muted px-1">/mcp</code> URL.
              MIT licensed, no warranty — outbound calls can incur cost.{" "}
              <Link href="/legal" className="text-primary hover:underline">
                License and disclaimer
              </Link>
              .
            </p>
          </div>
          <Card className="self-start shadow-lg">
            <CardHeader>
              <CardTitle className="text-base">Ask the knowledge base</CardTitle>
            </CardHeader>
            <CardContent>
              <DocsSearch />
              <p className="mt-3 text-xs text-muted-foreground">
                Same search the MCP <code>search_docs</code> tool uses.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-y bg-card/60">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: BookOpen,
              title: "Build the agent in chat",
              body: "Templates, paste-ready prompts, knowledge Q&A, and an app checklist. fonio has no create-assistant API yet.",
            },
            {
              icon: PhoneCall,
              title: "Real outbound calls",
              body: "Wraps POST /public/v1/outbound_call. fromNumber selects the assistant.",
            },
            {
              icon: KeyRound,
              title: "Workspace API key",
              body: "Claude and ChatGPT open this community connector, then you paste a key from app.fonio.ai/api-keys. Not fonio GmbH OAuth — we never collect your password.",
            },
            {
              icon: Shield,
              title: "Confirm before dialing",
              body: "Outbound is marked as a cost tool. The server refuses to guess numbers.",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <item.icon className="mt-0.5 size-5 text-primary" />
              <div>
                <h2 className="font-medium">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="install" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16">
        <p className="text-sm font-medium text-primary">Install</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight">Add this unofficial MCP</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Hosted MCP is at <code className="rounded bg-muted px-1 text-sm">{origin}/mcp</code>.
          Claude and ChatGPT will 401 without a key and open this community
          connector. Self-host if you do not want this host to store an encrypted
          key.
        </p>
        <div className="mt-8">
          <InstallPanel origin={origin} />
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,transparent,rgba(188,195,246,0.25))]">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">Tools</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight">
                What the assistant can do
              </h2>
            </div>
            <Link href="/tools" className="text-sm text-primary hover:underline">
              Full reference
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {TOOLS.map((tool) => (
              <Card key={tool.name}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                  <CardTitle className="font-mono text-base">{tool.name}</CardTitle>
                  <Badge variant="secondary">{tool.kind}</Badge>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {tool.summary}
                </CardContent>
              </Card>
            ))}
          </div>
          <h3 className="mt-12 text-lg font-semibold">Prompts</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {PROMPTS.map((prompt) => (
              <Card key={prompt.name}>
                <CardHeader>
                  <CardTitle className="font-mono text-sm">{prompt.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {prompt.summary}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Try asking</h2>
            <p className="mt-2 text-muted-foreground">
              Full threads with tool calls live on the examples page.
            </p>
          </div>
          <Link href="/examples" className="text-sm text-primary hover:underline">
            All examples
          </Link>
        </div>
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {EXAMPLES.map((example) => (
            <li key={example.slug}>
              <Link
                href={`/examples#${example.slug}`}
                className="block rounded-xl border bg-card px-4 py-3 hover:border-primary/40"
              >
                <p className="text-xs font-medium text-primary">{example.eyebrow}</p>
                <p className="mt-1 font-medium">{example.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">“{example.prompt}”</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
