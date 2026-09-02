import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connect a workspace key · unofficial community MCP",
};

export default function OAuthLayout({ children }: { children: React.ReactNode }) {
  return <div data-oauth-shell>{children}</div>;
}
