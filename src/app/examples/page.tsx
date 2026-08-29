import type { Metadata } from "next";
import { ExampleThread } from "@/components/example-thread";
import { EXAMPLES } from "@/lib/examples";

export const metadata: Metadata = { title: "Examples" };

export default function ExamplesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-medium text-primary">Examples</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">
        What to say after you connect
      </h1>
      <p className="mt-2 text-muted-foreground">
        Copy a prompt into Claude, ChatGPT, or Cursor. The thread shows which MCP
        tools fire — the same flow your customers will see.
      </p>
      <div className="mt-10 space-y-8">
        {EXAMPLES.map((example) => (
          <ExampleThread key={example.slug} example={example} />
        ))}
      </div>
    </div>
  );
}
