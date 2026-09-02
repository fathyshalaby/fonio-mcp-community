"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function HiddenFields({ fields }: { fields?: Record<string, string> }) {
  if (!fields) return null;
  return (
    <>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
    </>
  );
}

export function ConnectForm({
  action,
  hiddenFields,
  submitLabel = "Verify key and allow this unofficial MCP",
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
      <HiddenFields fields={hiddenFields} />

      <a
        href={SITE.login}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted"
      >
        Open official fonio login (app.fonio.ai)
      </a>
      <p className="text-center text-xs text-muted-foreground">
        That site is fonio GmbH. This page is an unofficial community connector.
        We never collect your fonio password.
      </p>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">then</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Copy a workspace API key from{" "}
        <a
          href={SITE.apiKeys}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary hover:underline"
        >
          app.fonio.ai/api-keys
        </a>
        . We verify it with fonio’s public{" "}
        <code className="text-xs">test-api-key</code> endpoint. This host then
        stores an encrypted copy so Claude/ChatGPT can call the public API —
        self-host this repo if you do not want that.
      </p>
      <div className="space-y-2">
        <Label htmlFor="apiKey">Workspace API key</Label>
        <Input
          id="apiKey"
          name="apiKey"
          type="password"
          autoComplete="off"
          required
          placeholder="Paste the key from app.fonio.ai/api-keys"
          className="h-11"
        />
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

export function ResumeSessionForm({
  action,
  switchAction,
  hiddenFields,
  fingerprint,
  clientName,
}: {
  action: (formData: FormData) => void | Promise<void>;
  switchAction: (formData: FormData) => void | Promise<void>;
  hiddenFields?: Record<string, string>;
  fingerprint: string;
  clientName?: string;
}) {
  const [busy, setBusy] = useState<"allow" | "switch" | null>(null);

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-muted/70 px-3 py-3 text-sm">
        <p className="font-medium">Workspace key saved on this community host</p>
        <p className="mt-0.5 text-muted-foreground">
          Key ending in ••••{fingerprint} (encrypted session, not a fonio
          password)
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        {clientName ? (
          <>
            Allow <span className="font-medium text-foreground">{clientName}</span>{" "}
            to use this unofficial MCP with that key for docs, paste-ready
            agents, and the public API.
          </>
        ) : (
          <>Allow this assistant to use the saved workspace API key.</>
        )}
      </p>
      <form
        action={action}
        onSubmit={() => setBusy("allow")}
        className="space-y-3"
      >
        <HiddenFields fields={hiddenFields} />
        <Button type="submit" className="h-10 w-full" disabled={busy !== null}>
          {busy === "allow" ? "Allowing…" : "Allow this unofficial MCP"}
        </Button>
      </form>
      <form action={switchAction} onSubmit={() => setBusy("switch")}>
        <HiddenFields fields={hiddenFields} />
        <Button
          type="submit"
          variant="ghost"
          className="h-10 w-full"
          disabled={busy !== null}
        >
          Use a different workspace key
        </Button>
      </form>
    </div>
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
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-primary">
          Unofficial community project
        </p>
        <p className="font-semibold">Community MCP for fonio</p>
        <p className="text-xs text-muted-foreground">
          Not fonio GmbH · MIT · workspace API key only
        </p>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {clientName ? (
        <p className="mt-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{clientName}</span> wants
          to use this unofficial connector with your workspace API key.
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          Log in on the official fonio app in a new tab, then paste a workspace
          API key here. We verify it against app.fonio.ai and keep an encrypted
          session — not in the chat transcript.
        </p>
      )}
      <div className="mt-6 rounded-2xl border bg-card p-5 shadow-sm">{children}</div>
    </div>
  );
}
