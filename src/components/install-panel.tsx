"use client";

import { useMemo } from "react";
import { CopyBlock } from "@/components/copy-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function InstallPanel({ origin }: { origin: string }) {
  const httpUrl = `${origin}/mcp`;

  const snippets = useMemo(
    () => ({
      claude: `Add a custom connector in Claude named unofficial-fonio-mcp with this URL (not an official fonio product):

${httpUrl}

On that screen: open official app.fonio.ai/login, copy a workspace key from app.fonio.ai/api-keys, paste it, allow access.

Prefer running this repo yourself (npm run mcp + FONIO_API_KEY, or Docker). A volunteer URL is unpaid, no warranty, no liability.`,
      claudeCode: `claude mcp add --transport http unofficial-fonio-mcp ${httpUrl}

# then inside a session:
/mcp
# complete the unofficial connector (paste workspace API key)`,
      cursor: `{
  "mcpServers": {
    "unofficial-fonio-mcp": {
      "url": "${httpUrl}"
    }
  }
}`,
      openai: `ChatGPT custom connector / OpenAI Agents remote MCP (label it unofficial-fonio-mcp):

${httpUrl}

ChatGPT starts unofficial MCP OAuth (401 + resource metadata). Log in on official app.fonio.ai, paste a workspace API key. This is open-source software, not a SaaS, not fonio GmbH. A volunteer URL has no warranty.`,
      vscode: `{
  "servers": {
    "unofficial-fonio-mcp": {
      "type": "http",
      "url": "${httpUrl}"
    }
  }
}`,
      stdio: `{
  "mcpServers": {
    "unofficial-fonio-mcp": {
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
        Open-source MCP, not a SaaS. HTTP needs a <strong>workspace API key</strong>{" "}
        (community PKCE — not fonio GmbH login). MIT, no warranty, no liability —
        including a volunteer free-domain URL. Run it yourself unless you accept
        an encrypted key on someone else’s machine.
      </p>
      <Tabs defaultValue="claude-code">
        <TabsList className="mb-4 h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="claude">Claude</TabsTrigger>
          <TabsTrigger value="claude-code">Claude Code</TabsTrigger>
          <TabsTrigger value="cursor">Cursor</TabsTrigger>
          <TabsTrigger value="openai">ChatGPT / OpenAI</TabsTrigger>
          <TabsTrigger value="vscode">VS Code</TabsTrigger>
          <TabsTrigger value="stdio">Local stdio (safest)</TabsTrigger>
        </TabsList>
        <TabsContent value="claude">
          <CopyBlock code={snippets.claude} />
        </TabsContent>
        <TabsContent value="claude-code">
          <p className="mb-3 text-sm text-muted-foreground">
            Run the add command, then <code className="text-xs">/mcp</code> to
            paste a workspace API key on this unofficial instance.
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
            Key stays on your machine:{" "}
            <code className="text-xs">FONIO_API_KEY=… npm run mcp</code>
          </p>
          <CopyBlock code={snippets.stdio} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
