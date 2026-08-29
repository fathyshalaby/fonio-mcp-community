import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        That route does not exist. Try the docs catalog or the install guide.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/" className={cn(buttonVariants())}>
          Overview
        </Link>
        <Link href="/docs" className={cn(buttonVariants({ variant: "outline" }))}>
          Docs
        </Link>
      </div>
    </div>
  );
}
