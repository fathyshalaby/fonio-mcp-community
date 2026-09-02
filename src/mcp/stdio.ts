#!/usr/bin/env npx tsx
import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { MCP_INSTRUCTIONS, registerFonioMcp } from "./register";
import { SERVER_NAME, SERVER_VERSION } from "./version";

function createServer() {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { instructions: MCP_INSTRUCTIONS },
  );
  registerFonioMcp(server, { allowEnvApiKey: true });
  return server;
}

serveStdio(() => createServer(), {
  onerror: (error) => {
    console.error("[unofficial-fonio-mcp]", error);
  },
});
