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
  issueOutboundConfirmation,
} from "@/oauth/tokens";
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
    throw new Error(
      "Connect your fonio workspace first. In Claude, ChatGPT, or Cursor, complete Sign in with fonio (official login at app.fonio.ai). For local stdio, set FONIO_API_KEY.",
    );
  }
  return new FonioClient(key);
}

export function registerFonioMcp(
  server: McpServer,
  options: RegisterOptions = {},
) {
  const allowEnvApiKey = options.allowEnvApiKey === true;
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
        openapi: FONIO_OPENAPI,
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
        "Turn a business description into a paste-ready fonio agent: start message, structured prompt, knowledge Q&A, tools to enable, technical defaults, and an app.fonio.ai checklist. The public API cannot create assistants — paste the output in the app. Prefer this when the user wants to create or redesign an agent.",
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
        "Verify that the connected fonio workspace key is valid via POST /public/v1/test-api-key. Uses the hosted OAuth session or FONIO_API_KEY for local stdio.",
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
        "List development servers registered on the workspace via GET /integrations/remote-registry/servers. These serve live integration manifests to fonio (not Claude MCP). Requires Sign in with fonio or FONIO_API_KEY.",
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

export const MCP_INSTRUCTIONS = `You are connected to an unofficial community MCP server for fonio.ai (${SERVER_NAME} v${SERVER_VERSION}). It is not affiliated with, endorsed by, or sponsored by fonio GmbH. MIT licensed, no warranty, and the authors are not liable for use of the software, including billed phone calls.

fonio is a European AI phone and WhatsApp assistant platform (app.fonio.ai, docs at fonio.info). This MCP is for building those agents from Claude, ChatGPT, or Cursor — same idea as the ElevenLabs MCP, scoped to fonio’s public API plus paste-ready assistant specs.

When the user wants to create, design, or improve an assistant:
1. Call list_assistant_templates (and list_voices if they ask about voice, Multi, or GDPR).
2. Call build_assistant with company, use case, languages, transfers, booking event, and facts you already have. Ask only for missing essentials.
3. Run validate_assistant_prompt and fix errors before handing the prompt over.
4. If they provided hours, FAQs, or a website summary, call draft_knowledge_base. Facts stay in the knowledge base, not duplicated in the prompt.
5. Give a paste-ready start message, prompt, Q&A, tools to enable, and the app.fonio.ai checklist.
The public API cannot create or update assistants. Never claim you saved the agent in the fonio workspace.

Rules:
- Search or read docs before inventing product behaviour.
- Never place an outbound call unless the user clearly asked and confirmed the destination number. First use prepare_outbound_call, ask for confirmation, then use its short-lived token plus confirmedToNumber with trigger_outbound_call.
- Outbound calls cost money and need KYC + an imported/SIP fromNumber. The user is responsible for those costs.
- Docs, templates, and build_assistant work without a key. Live API tools (test_api_key, outbound, remote integration servers) use the Sign in with fonio OAuth session (official login at app.fonio.ai), or FONIO_API_KEY for local stdio.
- If a live tool fails for missing auth, tell the user to complete Connect / Sign in with fonio in their MCP client.`;
