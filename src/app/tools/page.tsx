import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PROMPTS, TOOLS } from "@/lib/site";

export const metadata: Metadata = { title: "Tools" };

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">MCP tools</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Every tool registered by the fonio MCP server. Agent-builder and docs tools
        are read-only. Outbound calling is a write operation and incurs carrier
        cost.
      </p>
      <div className="mt-8 grid gap-4">
        {TOOLS.map((tool) => (
          <Card key={tool.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="font-mono text-lg">{tool.name}</CardTitle>
              <Badge variant="secondary">{tool.kind}</Badge>
            </CardHeader>
            <CardContent className="text-muted-foreground">{tool.summary}</CardContent>
          </Card>
        ))}
      </div>
      <h2 className="mt-12 text-2xl font-semibold">Prompts</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
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
      <h2 className="mt-12 text-2xl font-semibold">Resources</h2>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        <li>
          <code className="text-foreground">fonio://api/openapi</code> — public OpenAPI document
        </li>
        <li>
          <code className="text-foreground">fonio://variables</code> — built-in prompt variables
        </li>
        <li>
          <code className="text-foreground">fonio://assistants/templates</code> — starter kits for build_assistant
        </li>
        <li>
          <code className="text-foreground">fonio://voices</code> — documented voices, Multi, GDPR notes
        </li>
        <li>
          <code className="text-foreground">fonio://docs/{"{slug}"}</code> — markdown for each help article
        </li>
      </ul>
    </div>
  );
}
