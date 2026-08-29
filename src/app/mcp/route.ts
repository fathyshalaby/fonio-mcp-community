import {
  createMcpHandler,
  withMcpAuth,
} from "mcp-handler";
import type { AuthInfo } from "@modelcontextprotocol/server";
import { MCP_INSTRUCTIONS, registerFonioMcp } from "@/mcp/register";
import { SERVER_NAME, SERVER_VERSION } from "@/mcp/version";
import { publicOrigin } from "@/lib/origin";
import { readAccessToken } from "@/oauth/tokens";

const inner = createMcpHandler(
  (server) => {
    registerFonioMcp(server);
  },
  {
    serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
    instructions: MCP_INSTRUCTIONS,
  },
);

function verifyToken(_req: Request, bearerToken?: string): AuthInfo | undefined {
  if (!bearerToken) return undefined;
  const access = readAccessToken(bearerToken);
  return {
    token: bearerToken,
    clientId: access.clientId,
    scopes: ["fonio"],
    extra: { apiKey: access.apiKey },
  };
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const cors: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Accept, Authorization, mcp-session-id, mcp-protocol-version, Last-Event-ID",
  "Access-Control-Expose-Headers": "mcp-session-id, mcp-protocol-version",
};

function authed(request: Request) {
  return withMcpAuth(inner, verifyToken, {
    required: false,
    resourceMetadataPath: "/.well-known/oauth-protected-resource",
    resourceUrl: `${publicOrigin(request)}/mcp`,
  })(request);
}

async function withCors(request: Request) {
  let response: Response;
  try {
    response = await authed(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unauthorized";
    return new Response(JSON.stringify({ error: "invalid_token", error_description: message }), {
      status: 401,
      headers: {
        ...cors,
        "Content-Type": "application/json",
        "WWW-Authenticate": `Bearer realm="fonio", resource_metadata="${publicOrigin(request)}/.well-known/oauth-protected-resource"`,
      },
    });
  }
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
