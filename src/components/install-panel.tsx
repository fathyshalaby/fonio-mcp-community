"use client";

import { useMemo } from "react";
import { CopyBlock } from "@/components/copy-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function InstallPanel({ origin }: { origin: string }) {
  const httpUrl = `${origin}/mcp`;

  const snippets = useMemo(
    () => ({
      claude: `Add a custom connector in Claude with this URL, then complete Sign in with fonio (official app.fonio.ai login):

${httpUrl}

Claude Desktop (local stdio) still uses npm run mcp + FONIO_API_KEY if you prefer not to host.`,
      claudeCode: `claude mcp add --transport http fonio ${httpUrl}

# then inside a session:
/mcp`,
      cursor: `{
  "mcpServers": {
    "fonio": {
      "url": "${httpUrl}"
    }
  }
}`,
      openai: `ChatGPT custom connector / OpenAI Agents remote MCP:

${httpUrl}

Your client opens Sign in with fonio (log in at app.fonio.ai, then allow access). Docs tools work before that; live calls need the connected session.`,
      vscode: `{
  "servers": {
    "fonio": {
      "type": "http",
      "url": "${httpUrl}"
    }
  }
}`,
      stdio: `{
  "mcpServers": {
    "fonio": {
      "command": "npx",
      "args": ["tsx", "./src/mcp/stdio.ts"],
      "env": {
        "FONIO_API_KEY": "<your-fonio-api-key>"
      }
    }
  }
}`,
    }),
    [httpUrl],
  );

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <p className="mb-4 text-sm text-muted-foreground">
        Hosted MCP uses <strong>Sign in with fonio</strong> on the official app.
        Unofficial community project — MIT, no warranty, not affiliated with fonio.
      </p>
      <Tabs defaultValue="claude-code">
        <TabsList className="mb-4 h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="claude">Claude</TabsTrigger>
          <TabsTrigger value="claude-code">Claude Code</TabsTrigger>
          <TabsTrigger value="cursor">Cursor</TabsTrigger>
          <TabsTrigger value="openai">ChatGPT / OpenAI</TabsTrigger>
          <TabsTrigger value="vscode">VS Code</TabsTrigger>
          <TabsTrigger value="stdio">Local stdio</TabsTrigger>
        </TabsList>
        <TabsContent value="claude">
          <CopyBlock code={snippets.claude} />
        </TabsContent>
        <TabsContent value="claude-code">
          <p className="mb-3 text-sm text-muted-foreground">
            Run the add command, then <code className="text-xs">/mcp</code> to finish Sign in with fonio.
          </p>
          <CopyBlock code={snippets.claudeCode} />
        </TabsContent>
        <TabsContent value="cursor">
          <p className="mb-3 text-sm text-muted-foreground">
            Cursor Settings → MCP → <code className="text-xs">mcp.json</code>
          </p>
          <CopyBlock code={snippets.cursor} />
        </TabsContent>
        <TabsContent value="openai">
          <CopyBlock code={snippets.openai} />
        </TabsContent>
        <TabsContent value="vscode">
          <CopyBlock code={snippets.vscode} />
        </TabsContent>
        <TabsContent value="stdio">
          <p className="mb-3 text-sm text-muted-foreground">
            From the repo: <code className="text-xs">FONIO_API_KEY=… npm run mcp</code>
          </p>
          <CopyBlock code={snippets.stdio} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
