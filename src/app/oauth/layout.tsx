import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add a workspace key · unofficial open-source MCP",
};

export default function OAuthLayout({ children }: { children: React.ReactNode }) {
  return <div data-oauth-shell>{children}</div>;
}
