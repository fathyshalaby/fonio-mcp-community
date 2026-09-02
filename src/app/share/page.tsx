import type { Metadata } from "next";
import { CopyButton } from "@/components/copy-button";
import { CopyBlock } from "@/components/copy-block";
import {
  linkedInPostDe,
  linkedInPostEn,
  shortPostDe,
  shortPostEn,
} from "@/lib/examples";
import { headers } from "next/headers";
import { originFromHeaders } from "@/lib/origin";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Share this weekend project" };

export default async function SharePage() {
  const origin = originFromHeaders(await headers());
  const mcp = `${origin}/mcp`;
  const postEn = linkedInPostEn(mcp);
  const postDe = linkedInPostDe(mcp);
  const shortEn = shortPostEn(mcp);
  const shortDe = shortPostDe(mcp);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-medium text-primary">Weekend project</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">
        Post it as a personal open-source MCP
      </h1>
      <p className="mt-2 text-muted-foreground">
        Copy a post. Lead with GitHub, say you don’t work at fonio, that this is
        not a SaaS, and that MIT means no warranty and no liability. The{" "}
        <code className="rounded bg-muted px-1 text-sm">/mcp</code> URL on this
        origin is optional — people can self-host the repo instead.
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        Repo:{" "}
        <a href={SITE.github} className="text-primary hover:underline">
          {SITE.github}
        </a>
      </p>
      <div className="mt-4">
        <CopyBlock code={mcp} />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Short (EN)</h2>
        <CopyButton text={shortEn} label="Copy post" />
      </div>
      <pre className="mt-3 whitespace-pre-wrap rounded-2xl border bg-card p-5 text-sm leading-relaxed">
        {shortEn}
      </pre>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Short (DE)</h2>
        <CopyButton text={shortDe} label="Copy post" />
      </div>
      <pre className="mt-3 whitespace-pre-wrap rounded-2xl border bg-card p-5 text-sm leading-relaxed">
        {shortDe}
      </pre>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xl font-semibold">LinkedIn (EN)</h2>
        <CopyButton text={postEn} label="Copy post" />
      </div>
      <pre className="mt-3 whitespace-pre-wrap rounded-2xl border bg-card p-5 text-sm leading-relaxed">
        {postEn}
      </pre>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="text-xl font-semibold">LinkedIn (DE)</h2>
        <CopyButton text={postDe} label="Copy post" />
      </div>
      <pre className="mt-3 whitespace-pre-wrap rounded-2xl border bg-card p-5 text-sm leading-relaxed">
        {postDe}
      </pre>
    </div>
  );
}
