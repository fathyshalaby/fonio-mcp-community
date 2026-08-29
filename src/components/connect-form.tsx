"use client";

import { useState } from "react";
import { FonioMark } from "@/components/fonio-mark";
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
  submitLabel = "Allow access",
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
        className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Continue with fonio
      </a>
      <p className="text-center text-xs text-muted-foreground">
        Opens the official login at app.fonio.ai. We never collect your fonio
        password.
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
        After you log in, copy a workspace key from{" "}
        <a
          href={SITE.apiKeys}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary hover:underline"
        >
          API keys
        </a>
        . We verify it live with fonio’s{" "}
        <code className="text-xs">test-api-key</code> endpoint.
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
        <p className="font-medium">Signed in to fonio</p>
        <p className="mt-0.5 text-muted-foreground">
          Workspace key ending in ••••{fingerprint}
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        {clientName ? (
          <>
            Allow <span className="font-medium text-foreground">{clientName}</span>{" "}
            to use this workspace for docs and outbound calls.
          </>
        ) : (
          <>Allow this assistant to use your connected fonio workspace.</>
        )}
      </p>
      <form
        action={action}
        onSubmit={() => setBusy("allow")}
        className="space-y-3"
      >
        <HiddenFields fields={hiddenFields} />
        <Button type="submit" className="h-10 w-full" disabled={busy !== null}>
          {busy === "allow" ? "Allowing…" : "Allow access"}
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
          Use a different workspace
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
          Log in on fonio, then paste a workspace API key. We verify it against
          app.fonio.ai and keep an encrypted session — not in the chat transcript.
        </p>
      )}
      <div className="mt-6 rounded-2xl border bg-card p-5 shadow-sm">{children}</div>
    </div>
  );
}
