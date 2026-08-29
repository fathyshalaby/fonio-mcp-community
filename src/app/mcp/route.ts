import { createMcpHandler } from "mcp-handler";
import { MCP_INSTRUCTIONS, registerFonioMcp } from "@/mcp/register";
import { SERVER_NAME, SERVER_VERSION } from "@/mcp/version";

const handler = createMcpHandler(
  (server) => {
    registerFonioMcp(server);
  },
  {
    serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
    instructions: MCP_INSTRUCTIONS,
  },
);

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const cors: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Accept, Authorization, mcp-session-id, mcp-protocol-version, Last-Event-ID",
  "Access-Control-Expose-Headers": "mcp-session-id, mcp-protocol-version",
};

async function withCors(request: Request) {
  const response = await handler(request);
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(cors)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}

export async function GET(request: Request) {
  return withCors(request);
}

export async function POST(request: Request) {
  return withCors(request);
}

export async function DELETE(request: Request) {
  return withCors(request);
}
