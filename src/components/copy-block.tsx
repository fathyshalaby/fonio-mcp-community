"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyBlock({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className={cn("relative overflow-hidden rounded-xl border bg-foreground text-background", className)}>
      <button
        type="button"
        onClick={copy}
        className="absolute top-2 right-2 inline-flex size-8 items-center justify-center rounded-md bg-background/10 text-background hover:bg-background/20"
        aria-label="Copy"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
      <pre className="overflow-x-auto p-4 pr-12 font-mono text-[13px] leading-relaxed whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
}
