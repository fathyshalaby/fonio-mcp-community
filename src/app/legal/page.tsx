import type { Metadata } from "next";
import {
  AFFILIATION_DISCLAIMER,
  API_KEY_DISCLAIMER,
  DOCS_ACCURACY_DISCLAIMER,
  HOSTING_GUIDANCE,
  LIABILITY_DISCLAIMER,
  MCP_LIMITATION,
} from "@/lib/legal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "License, hosting & disclaimer" };

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-sm font-medium text-primary">Community member project</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">
        License, hosting, and disclaimer
      </h1>
      <p className="mt-4 text-muted-foreground">{AFFILIATION_DISCLAIMER}</p>
      <p className="mt-4 text-muted-foreground">{LIABILITY_DISCLAIMER}</p>
      <p className="mt-4 text-muted-foreground">{API_KEY_DISCLAIMER}</p>
      <p className="mt-4 text-muted-foreground">{MCP_LIMITATION}</p>
      <p className="mt-4 text-muted-foreground">{DOCS_ACCURACY_DISCLAIMER}</p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">
        Best way to host this
      </h2>
      <pre className="mt-3 whitespace-pre-wrap rounded-2xl border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
        {HOSTING_GUIDANCE}
      </pre>

      <p className="mt-4 text-muted-foreground">
        fonio, fonio.ai, and related marks belong to their owners. Use of those
        names here is only to describe compatibility with the public API. This
        site must not be read as an official fonio product, login, or OAuth
        provider.
      </p>
      <p className="mt-4 text-muted-foreground">
        Full license text:{" "}
        <a href={`${SITE.github}/blob/main/LICENSE`} className="text-primary hover:underline">
          MIT LICENSE
        </a>{" "}
        in this repository.
      </p>
    </div>
  );
}
