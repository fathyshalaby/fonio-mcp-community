export const SITE = {
  name: "fonio MCP",
  tagline: "Bring fonio to Claude, ChatGPT, and Cursor",
  description:
    "Official-style Model Context Protocol server for fonio.ai. Search the help center, inspect the public API, and trigger outbound calls from the assistants you already use.",
  app: "https://app.fonio.ai",
  docs: "https://fonio.info",
  academy: "https://fonio.academy",
  apiDocs: "https://app.fonio.ai/api/docs",
  support: "mailto:support@fonio.ai",
};

export const NAV = [
  { href: "/", label: "Overview" },
  { href: "/tools", label: "Tools" },
  { href: "/docs", label: "Docs" },
  { href: "/api", label: "API" },
];

export const TOOLS = [
  {
    name: "search_docs",
    kind: "Docs",
    summary:
      "Search bundled fonio.info knowledge: prompting, webhooks, campaigns, calendar, WhatsApp, GDPR.",
  },
  {
    name: "get_doc",
    kind: "Docs",
    summary: "Read the full markdown of an article by slug.",
  },
  {
    name: "list_docs",
    kind: "Docs",
    summary: "Catalog every bundled article with category and official URL.",
  },
  {
    name: "get_api_reference",
    kind: "API",
    summary: "OpenAPI for the public REST API, webhook source IPs, and built-in variables.",
  },
  {
    name: "test_api_key",
    kind: "API",
    summary: "Verify FONIO_API_KEY against POST /public/v1/test-api-key.",
  },
  {
    name: "trigger_outbound_call",
    kind: "Calls",
    summary:
      "Place a real outbound call. fromNumber selects the assistant. Confirm the destination first — this incurs carrier cost.",
  },
] as const;

export const PROMPTS = [
  {
    name: "write_assistant_prompt",
    summary: "Draft a production voice/WhatsApp prompt using fonio’s official structure.",
  },
  {
    name: "setup_outbound_call",
    summary: "Checklist for KYC, imported numbers, context variables, and the outbound API.",
  },
  {
    name: "setup_inbound_webhook",
    summary: "Design a pre-call CRM lookup with inboundContext and fallback greetings.",
  },
] as const;
