import { cookies, headers } from "next/headers";
import {
  issueWorkspaceCookieValue,
  readWorkspaceCookieValue,
  type WorkspaceSession,
} from "@/oauth/tokens";

export const WORKSPACE_COOKIE = "fonio_mcp_workspace";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

export type { WorkspaceSession };

async function cookieSecure(): Promise<boolean> {
  const h = await headers();
  const proto = (h.get("x-forwarded-proto") ?? "").split(",")[0]!.trim();
  if (proto) return proto === "https";
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "")
    .split(",")[0]!
    .trim();
  return Boolean(host) && !host.includes("localhost") && !host.startsWith("127.");
}

function cookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export async function getWorkspaceSession(): Promise<WorkspaceSession | null> {
  const jar = await cookies();
  const raw = jar.get(WORKSPACE_COOKIE)?.value;
  if (!raw) return null;
  try {
    return readWorkspaceCookieValue(raw);
  } catch {
    return null;
  }
}

export async function setWorkspaceSession(apiKey: string): Promise<void> {
  const jar = await cookies();
  jar.set(
    WORKSPACE_COOKIE,
    issueWorkspaceCookieValue(apiKey),
    cookieOptions(await cookieSecure()),
  );
}

export async function clearWorkspaceSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(WORKSPACE_COOKIE);
}
