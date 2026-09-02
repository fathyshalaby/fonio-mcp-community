"use client";

import { useMemo } from "react";
import { CopyBlock } from "@/components/copy-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function InstallPanel({ origin }: { origin: string }) {
  const httpUrl = `${origin}/mcp`;

  const snippets = useMemo(
    () => ({
      claude: `Add a custom connector in Claude with this URL. The client will ask you to authorize this unofficial community MCP (not fonio GmbH):

${httpUrl}

On that screen: open official app.fonio.ai/login, copy a workspace key from app.fonio.ai/api-keys, paste it, allow access.

Prefer local stdio if you do not want a host to store an encrypted key: npm run mcp + FONIO_API_KEY.`,
      claudeCode: `claude mcp add --transport http fonio-community ${httpUrl}

# then inside a session:
/mcp
# complete the community connector (paste workspace API key)`,
      cursor: `{
  "mcpServers": {
    "fonio-community": {
      "url": "${httpUrl}"
    }
  }
}`,
      openai: `ChatGPT custom connector / OpenAI Agents remote MCP:

${httpUrl}

ChatGPT starts community MCP OAuth (401 + resource metadata). Log in on official app.fonio.ai, paste a workspace API key, allow this unofficial MCP. Live tools will not work until that key is verified.`,
      vscode: `{
  "servers": {
    "fonio-community": {
      "type": "http",
      "url": "${httpUrl}"
    }
  }
}`,
      stdio: `{
  "mcpServers": {
    "fonio-community": {
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
        Hosted MCP requires a <strong>workspace API key</strong> so Claude and
        ChatGPT actually work. This is a community PKCE wrapper — not “Sign in
        with fonio” from fonio GmbH. Unofficial, MIT, no warranty, not affiliated
        with fonio. Self-host this repo unless you trust the operator with an
        encrypted key.
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
            paste a workspace API key on this community host.
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
