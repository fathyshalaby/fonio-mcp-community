import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign in with fonio" };

export default function OAuthLayout({ children }: { children: React.ReactNode }) {
  return <div data-oauth-shell>{children}</div>;
}
