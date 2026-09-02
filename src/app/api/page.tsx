import type { Metadata } from "next";
import { CopyBlock } from "@/components/copy-block";
import { WEBHOOK_SOURCE_IPS } from "@/mcp/docs";
import { FONIO_OPENAPI } from "@/mcp/openapi";

export const metadata: Metadata = { title: "API" };

const curl = `curl -X POST https://app.fonio.ai/api/public/v1/outbound_call \\
  -H "Authorization: Bearer $FONIO_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "fromNumber": "+43123456789",
    "toNumber": "+4915123456789",
    "context": { "name": "Ada", "reason": "follow-up" }
  }'`;

export default function ApiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Public API</h1>
      <p className="mt-2 text-muted-foreground">
        Fonio public API docs:{" "}
        <a href="https://app.fonio.ai/api/docs" className="text-primary hover:underline">
          app.fonio.ai/api/docs
        </a>
        . The MCP <code>get_api_reference</code>,{" "}
        <code>trigger_outbound_call</code>, and remote-integration tools wrap this
        surface. Creating assistants still happens in the app — use{" "}
        <code>build_assistant</code> for a paste-ready spec.
      </p>

      <h2 className="mt-10 text-xl font-semibold">Authentication</h2>
      <p className="mt-2 text-muted-foreground">
        Create a workspace API key in the fonio app. Send{" "}
        <code>Authorization: Bearer &lt;key&gt;</code>. Test with{" "}
        <code>POST /public/v1/test-api-key</code>.
      </p>

      <h2 className="mt-10 text-xl font-semibold">Trigger an outbound call</h2>
      <p className="mt-2 text-muted-foreground">
        <code>fromNumber</code> is your imported or SIP number and selects the
        outbound assistant. <code>toNumber</code> must match{" "}
        <code>^+\\d+$</code>. Optional <code>context</code> becomes{" "}
        <code>{"{{context.field}}"}</code> in the prompt. Requires Teams, KYC, and
        outbound-capable numbers. In the MCP flow, prepare the call first and
        confirm the destination before triggering it.
      </p>
      <div className="mt-4">
        <CopyBlock code={curl} />
      </div>

      <h2 className="mt-10 text-xl font-semibold">Remote integration servers</h2>
      <p className="mt-2 text-muted-foreground">
        PUT/GET/DELETE <code>/integrations/remote-registry/servers</code> registers
        a development server that serves integration manifests to fonio (max 5 per
        company). This is not the Claude MCP URL — it is how fonio pulls live
        integration definitions from your host. The MCP tools{" "}
        <code>list_remote_integration_servers</code>,{" "}
        <code>register_remote_integration_server</code>, and{" "}
        <code>delete_remote_integration_server</code> wrap these endpoints.
      </p>

      <h2 className="mt-10 text-xl font-semibold">Webhook source IPs</h2>
      <p className="mt-2 text-muted-foreground">
        Allowlist these addresses if you receive inbound, mid-call, or post-call
        HTTP from fonio:
      </p>
      <ul className="mt-3 list-disc pl-5 font-mono text-sm">
        {WEBHOOK_SOURCE_IPS.map((ip) => (
          <li key={ip}>{ip}</li>
        ))}
      </ul>

      <h2 className="mt-10 text-xl font-semibold">OpenAPI</h2>
      <pre className="mt-4 overflow-x-auto rounded-xl bg-foreground p-4 font-mono text-[12px] text-background">
        {JSON.stringify(FONIO_OPENAPI, null, 2)}
      </pre>
    </div>
  );
}
