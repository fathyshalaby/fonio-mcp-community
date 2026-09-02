export const SITE = {
  name: "Unofficial fonio MCP",
  tagline: "Weekend project — not fonio GmbH, not a SaaS",
  description:
    "Unofficial MIT open-source MCP for fonio.ai. fonio GmbH does not ship an official MCP. Not a SaaS. Self-host it, or use a volunteer free-domain copy with no warranty and no liability.",
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
    name: "get_connection_status",
    kind: "Auth",
    summary:
      "Show whether a workspace API key is connected (last four characters only). Hosted Claude/ChatGPT use community MCP OAuth + a key from app.fonio.ai/api-keys — not a fonio password.",
  },
  {
    name: "list_assistant_templates",
    kind: "Agents",
    summary:
      "Starter kits: receptionist, answering machine, appointment booking, first-level support, outbound callback, WhatsApp.",
  },
  {
    name: "build_assistant",
    kind: "Agents",
    summary:
      "Turn a business description into a paste-ready prompt, start message, knowledge Q&A, and app.fonio.ai checklist. The public API cannot create assistants.",
  },
  {
    name: "validate_assistant_prompt",
    kind: "Agents",
    summary:
      "Check a prompt for headings, If-Then rules, AI + recording disclosure, escape hatch, and the 100k limit.",
  },
  {
    name: "draft_knowledge_base",
    kind: "Agents",
    summary: "Turn company facts into caller-phrased Q&A for Knowledge → Information.",
  },
  {
    name: "list_voices",
    kind: "Agents",
    summary:
      "Documented multilingual voices, Multi-language rules, and GDPR notes (Azure EU vs ElevenLabs).",
  },
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
    summary: "Catalog every bundled article with category and Fonio source URL.",
  },
  {
    name: "list_examples",
    kind: "Docs",
    summary: "Ready-to-paste prompts: build an agent, receptionist, inbound webhook, form-to-call, confirmed dial.",
  },
  {
    name: "get_api_reference",
    kind: "API",
    summary:
      "OpenAPI for outbound calls, API-key test, and remote integration servers, plus webhook IPs and variables.",
  },
  {
    name: "test_api_key",
    kind: "API",
    summary: "Verify FONIO_API_KEY against POST /public/v1/test-api-key.",
  },
  {
    name: "list_remote_integration_servers",
    kind: "API",
    summary: "List development servers that serve live integration manifests to fonio.",
  },
  {
    name: "register_remote_integration_server",
    kind: "API",
    summary: "Register a public manifest server URL (max 5 per company).",
  },
  {
    name: "delete_remote_integration_server",
    kind: "API",
    summary: "Remove a registered remote integration server by UUID.",
  },
  {
    name: "prepare_outbound_call",
    kind: "Calls",
    summary: "Validate a destination and prepare a short-lived confirmation token without dialing.",
  },
  {
    name: "trigger_outbound_call",
    kind: "Calls",
    summary:
      "Place a real outbound call with a matching confirmation token. Confirm the destination first — this incurs carrier cost.",
  },
] as const;

export const PROMPTS = [
  {
    name: "build_voice_agent",
    summary: "Create a production voice or WhatsApp assistant from a business description.",
  },
  {
    name: "write_assistant_prompt",
    summary: "Draft a production voice/WhatsApp prompt using documented Fonio structure.",
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
