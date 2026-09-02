import type { Metadata } from "next";
import { CopyButton } from "@/components/copy-button";
import { CopyBlock } from "@/components/copy-block";
import { linkedInPostDe, linkedInPostEn } from "@/lib/examples";
import { headers } from "next/headers";
import { originFromHeaders } from "@/lib/origin";

export const metadata: Metadata = { title: "Share" };

export default async function SharePage() {
  const origin = originFromHeaders(await headers());
  const mcp = `${origin}/mcp`;
  const postEn = linkedInPostEn(mcp);
  const postDe = linkedInPostDe(mcp);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-medium text-primary">Community</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">
        Share this project
      </h1>
      <p className="mt-2 text-muted-foreground">
        Open-source MCP, not a SaaS. MIT, no warranty, no liability including
        billed phone calls or a volunteer-hosted URL. Not affiliated with,
        endorsed by, or sponsored by fonio. Copy a post and mention the GitHub
        repo. Example /mcp URL on this origin:
      </p>
      <div className="mt-4">
        <CopyBlock code={mcp} />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xl font-semibold">English</h2>
        <CopyButton text={postEn} label="Copy post" />
      </div>
      <pre className="mt-3 whitespace-pre-wrap rounded-2xl border bg-card p-5 text-sm leading-relaxed">
        {postEn}
      </pre>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Deutsch</h2>
        <CopyButton text={postDe} label="Copy post" />
      </div>
      <pre className="mt-3 whitespace-pre-wrap rounded-2xl border bg-card p-5 text-sm leading-relaxed">
        {postDe}
      </pre>
    </div>
  );
}
