"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FonioMark } from "@/components/fonio-mark";
import { NAV } from "@/lib/site";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  if (pathname.startsWith("/oauth")) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <FonioMark className="size-8 text-primary" />
          <span className="leading-tight">
            Community MCP
            <span className="block text-[11px] font-normal text-muted-foreground">
              unofficial · for fonio.ai
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-muted-foreground lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="https://github.com/fathyshalaby/fonio-mcp-community"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden sm:inline-flex",
            )}
          >
            GitHub
          </Link>
          <Link href="/connect" className={cn(buttonVariants({ size: "sm" }))}>
            Connect
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/oauth")) return null;

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          Unofficial community MCP by a community member — not fonio staff. MIT,
          no warranty, not liable including for billed phone calls, not
          affiliated with, endorsed by, or sponsored by fonio GmbH.{" "}
          <Link href="/legal" className="hover:text-foreground">
            License and disclaimer
          </Link>
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href="https://github.com/fathyshalaby/fonio-mcp-community"
            className="hover:text-foreground"
          >
            GitHub
          </a>
          <a href="https://app.fonio.ai" className="hover:text-foreground">
            fonio app
          </a>
          <a href="https://app.fonio.ai/api/docs" className="hover:text-foreground">
            Public API
          </a>
        </div>
      </div>
    </footer>
  );
}
