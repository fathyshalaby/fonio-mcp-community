import type { Metadata } from "next";
import Link from "next/link";
import { DocsSearch } from "@/components/docs-search";
import { Badge } from "@/components/ui/badge";
import { listArticles } from "@/mcp/docs";

export const metadata: Metadata = { title: "Docs" };

export default function DocsIndexPage() {
  const articles = listArticles();
  const categories = [...new Set(articles.map((article) => article.category))];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">fonio knowledge</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Bundled from{" "}
        <a href="https://fonio.info" className="text-primary hover:underline">
          fonio.info
        </a>{" "}
        and the public OpenAPI. The MCP <code>search_docs</code> /{" "}
        <code>get_doc</code> tools read this same catalog.
      </p>
      <div className="mt-8 max-w-xl">
        <DocsSearch />
      </div>
      <div className="mt-12 space-y-10">
        {categories.map((category) => (
          <section key={category}>
            <h2 className="text-lg font-semibold">{category}</h2>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {articles
                .filter((article) => article.category === category)
                .map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={`/docs/${article.slug}`}
                      className="block h-full rounded-xl border bg-card p-4 hover:border-primary/40"
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{article.title}</h3>
                        <Badge variant="outline">{article.slug}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {article.summary}
                      </p>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
