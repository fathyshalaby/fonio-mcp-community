import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getArticle } from "@/mcp/docs";
import { Badge } from "@/components/ui/badge";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  return { title: article?.title ?? "Doc" };
}

function renderMarkdown(body: string) {
  const blocks = body.split(/\n\n+/);
  return blocks.map((block, index) => {
    if (block.startsWith("```")) {
      const closed = block.replace(/^```[a-z]*\n?/, "").replace(/```$/, "");
      return (
        <pre
          key={index}
          className="overflow-x-auto rounded-xl bg-foreground p-4 font-mono text-[13px] text-background"
        >
          {closed}
        </pre>
      );
    }
    if (block.startsWith("# ")) {
      return (
        <h1 key={index} className="text-3xl font-semibold tracking-tight">
          {block.slice(2)}
        </h1>
      );
    }
    if (block.startsWith("## ")) {
      return (
        <h2 key={index} className="mt-8 text-xl font-semibold">
          {block.slice(3)}
        </h2>
      );
    }
    if (block.startsWith("### ")) {
      return (
        <h3 key={index} className="mt-6 text-lg font-semibold">
          {block.slice(4)}
        </h3>
      );
    }
    if (block.startsWith("| ")) {
      const rows = block.split("\n").filter((row) => !row.match(/^\|?\s*-+/));
      return (
        <div key={index} className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b">
                  {row
                    .split("|")
                    .filter(Boolean)
                    .map((cell, cellIndex) => {
                      const Tag = rowIndex === 0 ? "th" : "td";
                      return (
                        <Tag key={cellIndex} className="px-2 py-2 text-left">
                          {cell.trim()}
                        </Tag>
                      );
                    })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    if (block.startsWith("- ")) {
      return (
        <ul key={index} className="list-disc space-y-1 pl-5 text-muted-foreground">
          {block.split("\n").map((line, lineIndex) => (
            <li key={lineIndex}>{line.replace(/^- /, "")}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={index} className="text-muted-foreground leading-relaxed">
        {block}
      </p>
    );
  });
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm text-muted-foreground">
        <Link href="/docs" className="hover:text-foreground">
          Docs
        </Link>{" "}
        / {article.category}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{article.slug}</Badge>
        {article.tags.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>
      <div className="mt-6 space-y-4">{renderMarkdown(article.body)}</div>
      <p className="mt-10 text-sm">
        Source article:{" "}
        <a href={article.url} className="text-primary hover:underline">
          {article.url}
        </a>
      </p>
    </article>
  );
}
