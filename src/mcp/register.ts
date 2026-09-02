import {
  ResourceTemplate,
  type McpServer,
  type ServerContext,
  type ToolAnnotations,
} from "@modelcontextprotocol/server";
import { z } from "zod";
import {
  assertConfirmedDestination,
  assertE164,
  FonioApiError,
  FonioClient,
  getApiKey,
} from "./client";
import {
  articles,
  BUILTIN_VARIABLES,
  getArticle,
  listArticles,
  searchDocs,
  WEBHOOK_SOURCE_IPS,
} from "./docs";
import { FONIO_OPENAPI } from "./openapi";
import { EXAMPLES } from "@/lib/examples";
import { SERVER_NAME, SERVER_VERSION } from "./version";
import {
  consumeOutboundConfirmation,
  fingerprintKey,
  issueOutboundConfirmation,
} from "@/oauth/tokens";
import {
  AUTH_REQUIRED_MESSAGE,
  MCP_LIMITATION,
} from "@/lib/legal";
import {
  ASSISTANT_TEMPLATES,
  buildAssistant,
  draftKnowledgeBase,
  listAssistantTemplates,
  listVoicesAndLanguages,
  validateAssistantPrompt,
  type AssistantTemplateSlug,
} from "./assistant";

const readOnly: ToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: false,
};

const writeCall: ToolAnnotations = {
  readOnlyHint: false,
  destructiveHint: false,
  openWorldHint: true,
};

function textResult(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

function jsonResult(value: unknown) {
  return textResult(JSON.stringify(value, null, 2));
}

type RegisterOptions = {
  allowEnvApiKey?: boolean;
};

function apiKeyFrom(
  ctx: ServerContext | undefined,
  allowEnvApiKey: boolean,
): string | undefined {
  const extra = ctx?.http?.authInfo?.extra?.apiKey;
  if (typeof extra === "string" && extra.trim()) return extra.trim();
  return allowEnvApiKey ? getApiKey() : undefined;
}

function requireClient(ctx: ServerContext | undefined, allowEnvApiKey: boolean): FonioClient {
  const key = apiKeyFrom(ctx, allowEnvApiKey);
  if (!key) {
    throw new Error(AUTH_REQUIRED_MESSAGE);
  }
  return new FonioClient(key);
}

export function connectionSnapshot(
  ctx: ServerContext | undefined,
  allowEnvApiKey: boolean,
) {
  const extra = ctx?.http?.authInfo?.extra?.apiKey;
  if (typeof extra === "string" && extra.trim()) {
    return {
      connected: true,
      source: "community_mcp_oauth" as const,
      keyFingerprint: fingerprintKey(extra),
      livePublicApi: [
        "POST /public/v1/test-api-key",
        "POST /public/v1/outbound_call",
        "GET/PUT/DELETE /integrations/remote-registry/servers",
      ],
      cannotDo: [
        "Create or update assistants in app.fonio.ai (no public API)",
        "Collect a fonio password",
        "Call undocumented private app APIs",
      ],
      limitation: MCP_LIMITATION,
    };
  }
  const envKey = allowEnvApiKey ? getApiKey() : undefined;
  if (envKey) {
    return {
      connected: true,
      source: "FONIO_API_KEY" as const,
      keyFingerprint: fingerprintKey(envKey),
      livePublicApi: [
        "POST /public/v1/test-api-key",
        "POST /public/v1/outbound_call",
        "GET/PUT/DELETE /integrations/remote-registry/servers",
      ],
      cannotDo: [
        "Create or update assistants in app.fonio.ai (no public API)",
        "Collect a fonio password",
        "Call undocumented private app APIs",
      ],
      limitation: MCP_LIMITATION,
    };
  }
  return {
    connected: false,
    source: "none" as const,
    keyFingerprint: null,
    next: AUTH_REQUIRED_MESSAGE,
    limitation: MCP_LIMITATION,
  };
}

export function registerFonioMcp(
  server: McpServer,
  options: RegisterOptions = {},
) {
  const allowEnvApiKey = options.allowEnvApiKey === true;
  server.registerTool(
    "get_connection_status",
    {
      title: "Check workspace API key",
      description:
        "Show whether this unofficial community MCP has a fonio workspace API key (last four characters only). Hosted Claude/ChatGPT connect via community MCP OAuth plus a key from app.fonio.ai/api-keys — never a fonio password. Call this first if live API tools fail.",
      inputSchema: z.object({}),
      annotations: readOnly,
    },
    async (_input, ctx) => jsonResult(connectionSnapshot(ctx, allowEnvApiKey)),
  );
  server.registerTool(
    "search_docs",
    {
      title: "Search fonio docs",
      description:
        "Search fonio.ai help-center knowledge reproduced by this independent community MCP (fonio.info): prompting, numbers, outbound API, webhooks, integrations, calendar, WhatsApp, GDPR, and this MCP. Use this before guessing how a feature works.",
      inputSchema: z.object({
        query: z
          .string()
          .describe("Natural-language question or keywords, e.g. 'inbound webhook context'."),
        limit: z
          .number()
          .int()
          .min(1)
          .max(12)
          .optional()
          .describe("Max hits to return (default 6)."),
      }),
      annotations: readOnly,
    },
    async ({ query, limit }) => {
      const hits = searchDocs(query, limit ?? 6);
      if (hits.length === 0) {
        return textResult(
          `No articles matched “${query}”. Try list_docs, or search for prompting, outbound API, webhooks, calendar, or WhatsApp.`,
        );
      }
      return jsonResult({
        query,
        hint: "Call get_doc with a slug to read the full article.",
        results: hits,
      });
    },
  );

  server.registerTool(
    "get_doc",
    {
      title: "Read a fonio doc",
      description:
        "Return the full text of a fonio help article by slug (from search_docs or list_docs).",
      inputSchema: z.object({
        slug: z
          .string()
          .describe("Article slug, e.g. outbound-api, prompting, api-webhooks."),
      }),
      annotations: readOnly,
    },
    async ({ slug }) => {
      const article = getArticle(slug);
      if (!article) {
        const known = articles.map((item) => item.slug).join(", ");
        return textResult(`Unknown slug “${slug}”. Known slugs: ${known}`);
      }
      return textResult(
        `# ${article.title}\n\nSource: ${article.url}\nCategory: ${article.category}\n\n${article.body}`,
      );
    },
  );

  server.registerTool(
    "list_docs",
    {
      title: "List fonio docs",
      description: "List every bundled fonio help article with slug, summary, and official URL.",
      inputSchema: z.object({
        category: z
          .string()
          .optional()
          .describe(
            "Optional category filter: Getting started, Assistants, Phone & calls, Integrations, API, Product.",
          ),
      }),
      annotations: readOnly,
    },
    async ({ category }) => {
      const all = listArticles();
      const filtered = category
        ? all.filter(
            (article) =>
              article.category.toLowerCase() === category.toLowerCase(),
          )
        : all;
      return jsonResult({
        count: filtered.length,
        articles: filtered,
      });
    },
  );

  server.registerTool(
    "get_api_reference",
    {
      title: "fonio public API reference",
      description:
        "Return the fonio public OpenAPI spec (outbound calls and API-key test), plus webhook source IPs and variable names used in prompts.",
      inputSchema: z.object({}),
      annotations: readOnly,
    },
    async () =>
      jsonResult({
        docs: "https://app.fonio.ai/api/docs",
        helpCenter: {
          apiWebhooks: "https://fonio.info/articles/api-webhooks",
          outboundApi: "https://fonio.info/articles/outbound-calls/Outbound-API",
          promptGuide: "https://fonio.info/articles/how-to-write-a-great-prompt",
          languages: "https://fonio.info/articles/languages",
        },
        openapi: FONIO_OPENAPI,
        helpCenterOutboundApi: {
          note: "The help center documents a different body than the public OpenAPI. Copy the URL from assistant → Webhooks → Outbound API. This MCP trigger_outbound_call uses the public OpenAPI (camelCase + context).",
          required: ["api_key", "from_number", "to_number", "agent_id"],
          example: {
            api_key: "YOUR_API_KEY",
            from_number: "+43123456789",
            to_number: "+43198765432",
            agent_id: "YOUR_AGENT_ID",
            first_name: "Christian",
          },
        },
        webhookSourceIps: WEBHOOK_SOURCE_IPS,
        builtInVariables: BUILTIN_VARIABLES,
      }),
  );

  server.registerTool(
    "list_examples",
    {
      title: "Example prompts",
      description:
        "Ready-to-paste prompts that show how to use this MCP: build an agent, receptionist prompts, inbound webhooks, form-to-call, and a confirmed outbound call.",
      inputSchema: z.object({}),
      annotations: readOnly,
    },
    async () =>
      jsonResult(
        EXAMPLES.map((example) => ({
          slug: example.slug,
          title: example.title,
          prompt: example.prompt,
          tools: example.tools,
        })),
      ),
  );

  server.registerTool(
    "list_assistant_templates",
    {
      title: "List assistant templates",
      description:
        "Starter kits for building a fonio agent in Claude: receptionist, intelligent answering machine, appointment scheduling, first-level support, outbound lead callback, WhatsApp booking. Use before build_assistant.",
      inputSchema: z.object({}),
      annotations: readOnly,
    },
    async () => jsonResult({ templates: listAssistantTemplates() }),
  );

  server.registerTool(
    "list_voices",
    {
      title: "List fonio voices and languages",
      description:
        "Documented multilingual voices (Anna, Sophie, Ben, Brian, Maria), Multi-language rules, and GDPR notes. fonio has no public voice-list API — confirm the live picker in the app.",
      inputSchema: z.object({}),
      annotations: readOnly,
    },
    async () => jsonResult(listVoicesAndLanguages()),
  );

  server.registerTool(
    "build_assistant",
    {
      title: "Build a fonio assistant",
      description:
        "Turn a business description into a full paste-ready fonio agent: start messages, structured prompt, knowledge Q&A, transfers, calendar, webhooks, technical/GDPR, phone, and an app.fonio.ai checklist. The public API cannot create assistants — walk the user through pastePack. Prefer this when they want to create or configure an agent.",
      inputSchema: z.object({
        company: z.string().describe("Company or practice name."),
        useCase: z
          .string()
          .describe(
            "What the assistant should do, e.g. dental reception, after-hours plumber, outbound form callback.",
          ),
        template: z
          .string()
          .optional()
          .describe(
            "Optional slug from list_assistant_templates. Inferred from useCase when omitted.",
          ),
        assistantName: z
          .string()
          .optional()
          .describe("Spoken name of the AI, e.g. Marie."),
        languages: z
          .string()
          .optional()
          .describe("e.g. German, English, or 'German and English, Multi'."),
        transferTargets: z
          .string()
          .optional()
          .describe("Who to transfer to and when, with numbers if known."),
        bookingEvent: z
          .string()
          .optional()
          .describe("Exact Scheduler / Cal.com event name to book."),
        channel: z
          .enum(["voice", "whatsapp"])
          .optional()
          .describe("voice (default) or whatsapp."),
        direction: z
          .enum(["inbound", "outbound", "both"])
          .optional()
          .describe("Call direction. Outbound uses {{context.*}}."),
        companyFacts: z
          .string()
          .optional()
          .describe(
            "Hours, address, parking, services — becomes knowledge-base Q&A, not duplicated in the prompt.",
          ),
        formality: z
          .string()
          .optional()
          .describe("Address form, e.g. Sie, Du, or first name."),
        hours: z.string().optional().describe("Opening hours if known."),
      }),
      annotations: readOnly,
    },
    async (input) => {
      try {
        const spec = buildAssistant({
          ...input,
          template: input.template as AssistantTemplateSlug | undefined,
        });
        return jsonResult(spec);
      } catch (error) {
        return textResult(formatError(error));
      }
    },
  );

  server.registerTool(
    "validate_assistant_prompt",
    {
      title: "Validate a fonio prompt",
      description:
        "Check a draft prompt against documented fonio rules: 100k character limit, Markdown headings, If-Then paths, AI + recording disclosure, knowledge-base instruction, escape hatch, sensitive topics.",
      inputSchema: z.object({
        prompt: z.string().describe("The full prompt text to check."),
      }),
      annotations: readOnly,
    },
    async ({ prompt }) => jsonResult(validateAssistantPrompt(prompt)),
  );

  server.registerTool(
    "draft_knowledge_base",
    {
      title: "Draft knowledge-base Q&A",
      description:
        "Turn company facts into short Q&A entries phrased the way callers ask. Paste under Knowledge → Information. Do not copy these facts into the prompt.",
      inputSchema: z.object({
        company: z.string().describe("Company name."),
        facts: z
          .string()
          .describe("Free text, bullets, or 'Question? Answer' lines."),
        hours: z.string().optional().describe("Opening hours."),
        language: z.string().optional().describe("German or English, for question wording."),
      }),
      annotations: readOnly,
    },
    async ({ company, facts, hours, language }) =>
      jsonResult({
        entries: draftKnowledgeBase({ company, facts, hours, language }),
        hint: "Paste in Knowledge → Information. Enable Answer Questions on the assistant. One question = one entry.",
      }),
  );

  server.registerTool(
    "test_api_key",
    {
      title: "Test fonio API key",
      description:
        "Verify that the connected workspace API key is valid via POST /public/v1/test-api-key. Uses the community MCP OAuth session (hosted) or FONIO_API_KEY (local stdio).",
      inputSchema: z.object({}),
      annotations: { ...readOnly, openWorldHint: true },
    },
    async (_input, ctx) => {
      try {
        const result = await requireClient(ctx, allowEnvApiKey).testApiKey();
        return jsonResult(result);
      } catch (error) {
        return textResult(formatError(error));
      }
    },
  );

  server.registerTool(
    "prepare_outbound_call",
    {
      title: "Prepare an outbound call",
      description:
        "Validate an intended outbound call and return a short-lived confirmation token. This does not place a call. Ask the user to confirm the exact destination before using the token with trigger_outbound_call.",
      inputSchema: z.object({
        fromNumber: z
          .string()
          .describe(
            "Your outbound-capable fonio number in E.164, e.g. +43123456789. Selects the outbound assistant.",
          ),
        toNumber: z
          .string()
          .describe("Destination number in E.164, e.g. +4915123456789."),
        context: z
          .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
          .optional()
          .describe(
            "Optional prompt variables, e.g. { name: 'Ada', company: 'Acme' } → {{context.name}}.",
          ),
      }),
      annotations: { ...writeCall, destructiveHint: false },
    },
    async ({ fromNumber, toNumber, context }, ctx) => {
      try {
        const normalizedFromNumber = assertE164("fromNumber", fromNumber);
        const normalizedToNumber = assertE164("toNumber", toNumber);
        requireClient(ctx, allowEnvApiKey);
        return jsonResult({
          status: "ready_for_confirmation",
          fromNumber: normalizedFromNumber,
          toNumber: normalizedToNumber,
          context,
          confirmationToken: issueOutboundConfirmation({
            fromNumber: normalizedFromNumber,
            toNumber: normalizedToNumber,
          }),
          next:
            "Ask the user to confirm this exact destination number. Then call trigger_outbound_call with the token and confirmedToNumber.",
        });
      } catch (error) {
        return textResult(formatError(error));
      }
    },
  );

  server.registerTool(
    "trigger_outbound_call",
    {
      title: "Trigger outbound call",
      description:
        "COST: Places a real phone call via POST /public/v1/outbound_call. Requires a confirmationToken from prepare_outbound_call, confirmedToNumber matching the user-confirmed destination, Teams plan, KYC, and an imported or SIP fromNumber. fromNumber selects the outbound assistant assigned to that number. context is injected as {{context.field}} in the prompt.",
      inputSchema: z.object({
        fromNumber: z
          .string()
          .describe(
            "Your outbound-capable fonio number in E.164, e.g. +43123456789. Selects the outbound assistant.",
          ),
        toNumber: z
          .string()
          .describe("Destination number in E.164, e.g. +4915123456789."),
        context: z
          .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
          .optional()
          .describe(
            "Optional prompt variables, e.g. { name: 'Ada', company: 'Acme' } → {{context.name}}.",
          ),
        confirmedToNumber: z
          .string()
          .describe(
            "Required confirmation guard: repeat the exact destination number in E.164 only after the user explicitly confirmed that number. It must match toNumber after normalization.",
          ),
        confirmationToken: z
          .string()
          .describe(
            "Short-lived token returned by prepare_outbound_call for this exact destination. Only use it after the user confirmed the number.",
          ),
      }),
      annotations: writeCall,
    },
    async ({ fromNumber, toNumber, context, confirmedToNumber, confirmationToken }, ctx) => {
      try {
        const normalizedToNumber = assertConfirmedDestination(
          toNumber,
          confirmedToNumber,
        );
        const normalizedFromNumber = assertE164("fromNumber", fromNumber);
        const client = requireClient(ctx, allowEnvApiKey);
        const pending = consumeOutboundConfirmation(confirmationToken);
        if (
          pending.fromNumber !== normalizedFromNumber ||
          pending.toNumber !== normalizedToNumber
        ) {
          throw new Error(
            "Confirmation token does not match this call. Prepare the exact fromNumber and toNumber again, then ask the user to confirm.",
          );
        }
        const result = await client.triggerOutboundCall({
          fromNumber: normalizedFromNumber,
          toNumber: normalizedToNumber,
          context,
        });
        return jsonResult(result);
      } catch (error) {
        return textResult(formatError(error));
      }
    },
  );

  server.registerTool(
    "list_remote_integration_servers",
    {
      title: "List remote integration servers",
      description:
        "List development servers registered on the workspace via GET /integrations/remote-registry/servers. These serve live integration manifests to fonio (not Claude MCP). Requires a connected workspace API key.",
      inputSchema: z.object({}),
      annotations: { ...readOnly, openWorldHint: true },
    },
    async (_input, ctx) => {
      try {
        const servers = await requireClient(ctx, allowEnvApiKey).listRemoteIntegrationServers();
        return jsonResult({ servers });
      } catch (error) {
        return textResult(formatError(error));
      }
    },
  );

  server.registerTool(
    "register_remote_integration_server",
    {
      title: "Register a remote integration server",
      description:
        "PUT /integrations/remote-registry/servers — register a public base URL that serves integration manifests. fonio sends authToken as Bearer on every call. Max 5 servers per company. Requires a connected workspace.",
      inputSchema: z.object({
        baseUrl: z
          .string()
          .describe("Public https base URL of the manifest server."),
        authToken: z
          .string()
          .describe("Bearer token fonio should send to your server (1–512 chars)."),
      }),
      annotations: writeCall,
    },
    async ({ baseUrl, authToken }, ctx) => {
      try {
        const result = await requireClient(
          ctx,
          allowEnvApiKey,
        ).registerRemoteIntegrationServer({ baseUrl, authToken });
        return jsonResult(result);
      } catch (error) {
        return textResult(formatError(error));
      }
    },
  );

  server.registerTool(
    "delete_remote_integration_server",
    {
      title: "Delete a remote integration server",
      description:
        "DELETE /integrations/remote-registry/servers — remove a registered manifest server by the UUID from list_remote_integration_servers.",
      inputSchema: z.object({
        id: z.string().describe("Server UUID from list_remote_integration_servers."),
      }),
      annotations: { ...writeCall, destructiveHint: true },
    },
    async ({ id }, ctx) => {
      try {
        const result = await requireClient(ctx, allowEnvApiKey).deleteRemoteIntegrationServer(id);
        return jsonResult(result);
      } catch (error) {
        return textResult(formatError(error));
      }
    },
  );

  server.registerResource(
    "openapi",
    "fonio://api/openapi",
    {
      title: "Fonio Public API OpenAPI",
      description: "OpenAPI 3 document for the public REST API.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(FONIO_OPENAPI, null, 2),
        },
      ],
    }),
  );

  server.registerResource(
    "variables",
    "fonio://variables",
    {
      title: "fonio prompt variables",
      description: "Built-in template variables and webhook source IPs.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(
            { builtInVariables: BUILTIN_VARIABLES, webhookSourceIps: WEBHOOK_SOURCE_IPS },
            null,
            2,
          ),
        },
      ],
    }),
  );

  server.registerResource(
    "templates",
    "fonio://assistants/templates",
    {
      title: "fonio assistant templates",
      description: "Starter kits for building paste-ready fonio agents.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(
            ASSISTANT_TEMPLATES.map((template) => ({
              slug: template.slug,
              title: template.title,
              summary: template.summary,
              channel: template.channel,
              toolsToEnable: template.toolsToEnable,
            })),
            null,
            2,
          ),
        },
      ],
    }),
  );

  server.registerResource(
    "voices",
    "fonio://voices",
    {
      title: "fonio voices and languages",
      description: "Documented voices, Multi-language rules, and GDPR notes.",
      mimeType: "application/json",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "application/json",
          text: JSON.stringify(listVoicesAndLanguages(), null, 2),
        },
      ],
    }),
  );

  server.registerResource(
    "docs",
    new ResourceTemplate("fonio://docs/{slug}", {
      list: async () => ({
        resources: articles.map((article) => ({
          uri: `fonio://docs/${article.slug}`,
          name: article.title,
          description: article.summary,
          mimeType: "text/markdown",
        })),
      }),
    }),
    {
      title: "fonio help article",
      description: "Markdown body of a bundled fonio.info article.",
      mimeType: "text/markdown",
    },
    async (uri, variables) => {
      const raw = variables.slug;
      const slug = String(Array.isArray(raw) ? raw[0] : raw ?? "");
      const article = getArticle(slug);
      if (!article) {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "text/plain",
              text: `Unknown article: ${slug}`,
            },
          ],
        };
      }
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "text/markdown",
            text: `# ${article.title}\n\n${article.body}\n\n---\nSource (Fonio docs): ${article.url}`,
          },
        ],
      };
    },
  );

  server.registerPrompt(
    "build_voice_agent",
    {
      title: "Build a fonio voice or WhatsApp agent",
      description:
        "Create a production fonio assistant from a business description: template, prompt, knowledge Q&A, and app checklist.",
      argsSchema: z.object({
        company: z.string().describe("Company or practice name."),
        useCase: z.string().describe("What the assistant should do."),
      }),
    },
    ({ company, useCase }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Build a production fonio.ai assistant for ${company}. Use case: ${useCase}.

Call list_assistant_templates, then build_assistant with the best slug. If facts are missing, ask only for essentials (languages, transfers, booking event, hours). Run validate_assistant_prompt and fix errors. If I pasted company facts, also call draft_knowledge_base.

Return: (1) start message, (2) paste-ready prompt, (3) knowledge Q&A, (4) tools to enable, (5) the app.fonio.ai checklist. The public API cannot save the assistant — never claim you created it in the workspace.`,
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "write_assistant_prompt",
    {
      title: "Write a fonio assistant prompt",
      description:
        "Draft a production prompt for a fonio voice or WhatsApp assistant using documented Fonio structure.",
      argsSchema: z.object({
        company: z.string().describe("Company or practice name."),
        useCase: z
          .string()
          .describe("What the assistant should do, e.g. dental reception, after-hours plumber."),
        languages: z
          .string()
          .optional()
          .describe("Languages, e.g. German and English. Use Multi if it should switch."),
        transferTargets: z
          .string()
          .optional()
          .describe("Who to transfer to and when."),
      }),
    },
    ({ company, useCase, languages, transferTargets }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Write a fonio.ai assistant prompt for ${company}. Use case: ${useCase}.
Languages: ${languages || "match the business; mention Multi if needed"}.
Transfer targets: ${transferTargets || "ask me if unknown"}.

Follow get_doc slug prompting: headings, if-then rules, AI + recording disclosure (GDPR), knowledge-base instruction, escape hatch, no duplicated facts. Output a paste-ready prompt plus a short list of tools/integrations to enable in the app.`,
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "setup_outbound_call",
    {
      title: "Set up an outbound call",
      description:
        "Walk through KYC, imported numbers, context variables, and the public outbound API / MCP tool.",
      argsSchema: z.object({
        goal: z.string().describe("Why you are calling, e.g. qualify a web-form lead."),
      }),
    },
    ({ goal }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Help me place fonio outbound calls for: ${goal}.
Read outbound-api and outbound-calls docs. Check: Teams plan, KYC, imported/SIP fromNumber, outbound assistant assignment, E.164 toNumber, context fields in the prompt.
Then either: (1) give a curl example for POST https://app.fonio.ai/api/public/v1/outbound_call or (2) if I confirmed the destination, call trigger_outbound_call.`,
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "setup_inbound_webhook",
    {
      title: "Set up an inbound webhook",
      description: "Design the pre-call lookup that personalizes greetings from CRM data.",
      argsSchema: z.object({
        system: z
          .string()
          .describe("Where caller data lives, e.g. HubSpot, Google Sheet, custom API."),
      }),
    },
    ({ system }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Design a fonio inbound webhook that looks up callers in ${system}.
Use api-webhooks and variables docs. Cover payload {fromNumber, toNumber}, JSON response, {{field}} vs {{inboundContext.field}}, fallback greeting, allowlisted IPs, and a Make/n8n sketch.`,
          },
        },
      ],
    }),
  );
}

function formatError(error: unknown): string {
  if (error instanceof FonioApiError) {
    return `fonio API error (${error.status || "network"}): ${error.message}`;
  }
  if (error instanceof Error) return error.message;
  return String(error);
}

export const MCP_INSTRUCTIONS = `You are connected to the unofficial fonio MCP (${SERVER_NAME} v${SERVER_VERSION}). This is not a SaaS product and not an official fonio GmbH MCP — as of 2026-09-02 fonio does not ship one (public OpenAPI, fonio.info, and the public MCP registry have none). The authors are community members, not fonio staff. Not affiliated with, endorsed by, or sponsored by fonio GmbH. MIT licensed, no warranty, not liable including billed phone calls, downtime, or stored API keys on a volunteer URL. Bundled docs can be wrong — prefer fonio.info and app.fonio.ai.

fonio is a European AI phone and WhatsApp assistant platform (app.fonio.ai, docs at fonio.info). This MCP lets Claude, ChatGPT, or Cursor configure a complete paste-ready agent and call the documented public API. ${MCP_LIMITATION}

Auth: HTTP Claude/ChatGPT must complete this unofficial connector (open official app.fonio.ai/login, then paste a workspace key from app.fonio.ai/api-keys). That is not fonio GmbH OAuth and never collects a password. Local stdio uses FONIO_API_KEY. Call get_connection_status if unsure. If it is not connected, tell the user to finish the connector or run this repo themselves. A volunteer-hosted URL is unpaid, no SLA, no liability.

When the user wants to create, design, configure, or improve an assistant:
1. Call get_connection_status if they also want live API actions.
2. Call list_assistant_templates (official copy-paste kits from fonio.info) and list_voices if they ask about voice, Multi, or GDPR.
3. Call build_assistant. Walk through every pastePack section (start messages, prompt, knowledge, tools, transfers, calendar, webhooks, technical, phone, GDPR, checklist). Official templates use ## Role / ## Conversation flow / ## If / Then rules / ## Important rules. Keep prompts short (~300 words).
4. Multi language does NOT auto-switch — the prompt must contain an explicit If/Then (fonio.info/articles/languages). The start message is never translated.
5. Run validate_assistant_prompt and fix errors.
6. If they provided hours or FAQs, call draft_knowledge_base. Facts stay in the knowledge base.
7. There are two outbound API shapes: public OpenAPI (camelCase, context, fromNumber selects assistant — this MCP) vs help-center Webhooks URL (snake_case, agent_id, extra top-level keys). Read outbound-api before generating curl.
Never claim you saved the agent in the fonio workspace.

Rules:
- Search or read docs before inventing product behaviour.
- Never place an outbound call unless the user clearly asked and confirmed the destination number. First use prepare_outbound_call, ask for confirmation, then use its short-lived token plus confirmedToNumber with trigger_outbound_call.
- Outbound calls cost money and need KYC + an imported/SIP fromNumber. The user is responsible for those costs.
- Live API tools need a connected workspace key. If they fail for missing auth, quote get_connection_status.next and do not invent a login to fonio GmbH.`;
