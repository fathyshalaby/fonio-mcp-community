import { CopyButton } from "@/components/copy-button";
import { Badge } from "@/components/ui/badge";
import type { Example } from "@/lib/examples";

export function ExampleThread({ example }: { example: Example }) {
  return (
    <article
      id={example.slug}
      className="scroll-mt-24 overflow-hidden rounded-2xl border bg-card shadow-sm"
    >
      <header className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-primary uppercase">
            {example.eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">{example.title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{example.summary}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {example.tools.map((tool) => (
              <Badge key={tool} variant="secondary" className="font-mono font-normal">
                {tool}
              </Badge>
            ))}
          </div>
        </div>
        <CopyButton text={example.prompt} label="Copy prompt" className="shrink-0" />
      </header>
      <ol className="space-y-3 p-5">
        {example.thread.map((turn, index) => (
          <li
            key={`${example.slug}-${index}`}
            className={
              turn.role === "user"
                ? "ml-6 rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-sm text-primary-foreground"
                : turn.role === "tool"
                  ? "rounded-xl border border-dashed bg-muted/60 px-4 py-3 font-mono text-xs text-muted-foreground"
                  : "mr-6 rounded-2xl rounded-tl-md border bg-background px-4 py-3 text-sm whitespace-pre-wrap"
            }
          >
            <p className="mb-1 text-[11px] font-medium tracking-wide uppercase opacity-70">
              {turn.role === "tool" ? `Tool · ${turn.name}` : turn.role === "user" ? "You" : "Claude"}
            </p>
            {turn.text}
          </li>
        ))}
      </ol>
    </article>
  );
}
