"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { searchDocs, type DocHit } from "@/mcp/docs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function DocsSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const results: DocHit[] = useMemo(
    () => (query.trim() ? searchDocs(query, 8) : []),
    [query],
  );

  return (
    <div>
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Ask about outbound API, inbound webhooks, prompts…"
        className="h-11 bg-background"
      />
      {query.trim() ? (
        <ul className="mt-4 space-y-2">
          {results.length === 0 ? (
            <li className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              No matches. Try “KYC”, “fromNumber”, or “Handlebars”.
            </li>
          ) : (
            results.map((hit) => (
              <li key={hit.slug}>
                <Link
                  href={`/docs/${hit.slug}`}
                  className="block rounded-xl border bg-card p-4 transition-colors hover:border-primary/40"
                >
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-medium">{hit.title}</span>
                    <Badge variant="secondary">{hit.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{hit.excerpt}</p>
                </Link>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
