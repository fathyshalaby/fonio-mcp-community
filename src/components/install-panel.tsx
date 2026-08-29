"use client";

import { useMemo, useState } from "react";
import { CopyBlock } from "@/components/copy-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function claudeDesktop(apiKey: string) {
  return `{
  "mcpServers": {
    "fonio": {
      "command": "npx",
      "args": ["tsx", "./src/mcp/stdio.ts"],
      "env": {
        "FONIO_API_KEY": "${apiKey || "<your-fonio-api-key>"}"
      }
    }
  }
}`;
}

export function InstallPanel({ origin }: { origin: string }) {
  const httpUrl = `${origin}/mcp`;
  const [key, setKey] = useState("");
  const placeholder = key || "<your-fonio-api-key>";

  const snippets = useMemo(
    () => ({
      claudeCode: `claude mcp add --transport http fonio ${httpUrl}`,
      cursor: `{
  "mcpServers": {
    "fonio": {
      "url": "${httpUrl}"
    }
  }
}`,
      openai: `Use the fonio MCP as a remote server:

${httpUrl}

Set FONIO_API_KEY in the connector environment, or pass apiKey to test_api_key / trigger_outbound_call.`,
      vscode: `{
  "servers": {
    "fonio": {
      "type": "http",
      "url": "${httpUrl}"
    }
  }
}`,
      stdio: claudeDesktop(placeholder),
    }),
    [httpUrl, placeholder],
  );

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-6">
      <label className="mb-4 block text-sm">
        <span className="mb-1.5 block font-medium">API key (stays in this browser)</span>
        <input
          value={key}
          onChange={(event) => setKey(event.target.value)}
          placeholder="Paste a workspace key from app.fonio.ai"
          className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          autoComplete="off"
        />
      </label>
      <Tabs defaultValue="claude">
        <TabsList className="mb-4 h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="claude">Claude</TabsTrigger>
          <TabsTrigger value="claude-code">Claude Code</TabsTrigger>
          <TabsTrigger value="cursor">Cursor</TabsTrigger>
          <TabsTrigger value="openai">ChatGPT / OpenAI</TabsTrigger>
          <TabsTrigger value="vscode">VS Code</TabsTrigger>
          <TabsTrigger value="stdio">Local stdio</TabsTrigger>
        </TabsList>
        <TabsContent value="claude">
          <p className="mb-3 text-sm text-muted-foreground">
            Claude Desktop talks to MCP over stdio. Add this to{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">claude_desktop_config.json</code>{" "}
            after cloning this repo and running <code className="text-xs">npm install</code>.
          </p>
          <CopyBlock code={snippets.stdio} />
        </TabsContent>
        <TabsContent value="claude-code">
          <p className="mb-3 text-sm text-muted-foreground">
            Point Claude Code at the hosted Streamable HTTP endpoint, then run{" "}
            <code className="text-xs">/mcp</code> in a session if prompted.
          </p>
          <CopyBlock code={snippets.claudeCode} />
        </TabsContent>
        <TabsContent value="cursor">
          <p className="mb-3 text-sm text-muted-foreground">
            Cursor Settings → MCP. Paste into{" "}
            <code className="text-xs">mcp.json</code>.
          </p>
          <CopyBlock code={snippets.cursor} />
        </TabsContent>
        <TabsContent value="openai">
          <p className="mb-3 text-sm text-muted-foreground">
            ChatGPT developer mode and the OpenAI Agents SDK accept remote MCP servers. Use this URL as the server endpoint.
          </p>
          <CopyBlock code={snippets.openai} />
        </TabsContent>
        <TabsContent value="vscode">
          <p className="mb-3 text-sm text-muted-foreground">
            VS Code MCP support (Copilot / agent) — add to{" "}
            <code className="text-xs">.vscode/mcp.json</code>.
          </p>
          <CopyBlock code={snippets.vscode} />
        </TabsContent>
        <TabsContent value="stdio">
          <p className="mb-3 text-sm text-muted-foreground">
            From the repo root: <code className="text-xs">FONIO_API_KEY=… npm run mcp</code>
          </p>
          <CopyBlock code={snippets.stdio} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
