"use client";

import { useState } from "react";
import { FonioMark } from "@/components/fonio-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ConnectForm({
  action,
  hiddenFields,
  submitLabel = "Connect workspace",
  error,
}: {
  action: string | ((formData: FormData) => void | Promise<void>);
  hiddenFields?: Record<string, string>;
  submitLabel?: string;
  error?: string;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <form
      action={action}
      method="post"
      className="space-y-4"
      onSubmit={() => setBusy(true)}
    >
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))
        : null}
      <div className="space-y-2">
        <Label htmlFor="apiKey">fonio API key</Label>
        <Input
          id="apiKey"
          name="apiKey"
          type="password"
          autoComplete="off"
          required
          placeholder="Paste the key from app.fonio.ai"
          className="h-11"
        />
        <p className="text-xs text-muted-foreground">
          Open{" "}
          <a
            href="https://app.fonio.ai"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            app.fonio.ai
          </a>{" "}
          → create or copy your workspace API key. We verify it with fonio’s{" "}
          <code>test-api-key</code> endpoint and never show it back to the client.
        </p>
      </div>
      {error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="h-10 w-full" disabled={busy}>
        {busy ? "Connecting…" : submitLabel}
      </Button>
    </form>
  );
}

export function ConnectShell({
  title,
  children,
  clientName,
}: {
  title: string;
  children: React.ReactNode;
  clientName?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <div className="mb-6 flex items-center gap-2">
        <FonioMark className="size-9 text-primary" />
        <div>
          <p className="font-semibold">fonio</p>
          <p className="text-xs text-muted-foreground">Connect your workspace</p>
        </div>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {clientName ? (
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{clientName}</span> wants
          permission to search fonio docs and place outbound calls as your workspace.
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          Same sign-in Claude, ChatGPT, and Cursor use. Your key stays on the MCP
          server as an encrypted token — not in the chat transcript.
        </p>
      )}
      <div className="mt-6 rounded-2xl border bg-card p-5 shadow-sm">{children}</div>
    </div>
  );
}
