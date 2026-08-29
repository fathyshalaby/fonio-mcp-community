import Link from "next/link";
import { FonioMark } from "@/components/fonio-mark";
import { NAV } from "@/lib/site";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <FonioMark className="size-8 text-primary" />
          <span>fonio MCP</span>
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
            href="https://fonio.info"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden sm:inline-flex",
            )}
          >
            Help center
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
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          MCP for fonio.ai — Sign in with fonio, then search docs and place outbound
          calls from Claude, ChatGPT, or Cursor.
        </p>
        <div className="flex flex-wrap gap-4">
          <a href="https://app.fonio.ai" className="hover:text-foreground">
            Open app
          </a>
          <a href="https://app.fonio.ai/api/docs" className="hover:text-foreground">
            API docs
          </a>
          <a href="https://fonio.academy" className="hover:text-foreground">
            Academy
          </a>
          <a href="mailto:support@fonio.ai" className="hover:text-foreground">
            support@fonio.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
