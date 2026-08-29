export const SITE = {
  name: "fonio MCP",
  tagline: "Unofficial community MCP for fonio.ai",
  description:
    "Independent open-source MCP server for fonio’s public API. Not affiliated with fonio GmbH. MIT licensed, no warranty.",
  app: "https://app.fonio.ai",
  login: "https://app.fonio.ai/login",
  apiKeys: "https://app.fonio.ai/api-keys",
  docs: "https://fonio.info",
  academy: "https://fonio.academy",
  apiDocs: "https://app.fonio.ai/api/docs",
  support: "mailto:support@fonio.ai",
  github: "https://github.com/fathyshalaby/fonio-mcp-community",
};

export const NAV = [
  { href: "/", label: "Overview" },
  { href: "/examples", label: "Examples" },
  { href: "/tools", label: "Tools" },
  { href: "/docs", label: "Docs" },
  { href: "/api", label: "API" },
  { href: "/share", label: "Share" },
  { href: "/legal", label: "Legal" },
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
    name: "list_examples",
    kind: "Docs",
    summary: "Ready-to-paste prompts: receptionist, inbound webhook, form-to-call, confirmed dial.",
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
