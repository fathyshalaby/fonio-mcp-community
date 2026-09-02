export type DocCategory =
  | "Getting started"
  | "Assistants"
  | "Phone & calls"
  | "Integrations"
  | "API"
  | "Product";

export type DocArticle = {
  slug: string;
  title: string;
  summary: string;
  category: DocCategory;
  url: string;
  tags: string[];
  body: string;
};

export const BUILTIN_VARIABLES = [
  { name: "companyId", description: "Workspace / company identifier." },
  { name: "conversationId", description: "Unique id of this call or chat." },
  { name: "conversationLink", description: "Deep link to the conversation in the fonio inbox." },
  { name: "agentNumber", description: "The fonio number that handled the conversation." },
  { name: "personNumber", description: "The caller's (or WhatsApp) number." },
  { name: "startTimestamp", description: "When the conversation started." },
  { name: "direction", description: "inbound or outbound." },
  { name: "fonio.agent.name", description: "Name of the assistant." },
  { name: "fonio.company.name", description: "Company name from the workspace." },
  { name: "plainTranscript", description: "Plain-text transcript of the call, for emails." },
  { name: "disconnectReason", description: "Why the call ended." },
  { name: "audioLink", description: "Link to the call recording when available." },
];

export const WEBHOOK_SOURCE_IPS = [
  "128.140.42.143",
  "128.140.34.113",
  "167.233.91.1",
  "167.233.75.149",
  "178.105.222.76",
];

export const articles: DocArticle[] = [
  {
    slug: "mcp",
    title: "Community MCP for fonio",
    summary:
      "Unofficial community MCP: Claude, ChatGPT, and Cursor configure paste-ready agents and call the public API with a workspace API key. Not fonio GmbH.",
    category: "API",
    url: "https://fonio.info",
    tags: ["mcp", "claude", "openai", "cursor", "chatgpt", "agents"],
    body: `# Community MCP for fonio (unofficial)

This MCP server is an **unofficial community** Model Context Protocol interface for fonio. The authors are community members, not fonio staff. It is not affiliated with, endorsed by, or sponsored by fonio GmbH. MIT licensed, no warranty, and the authors are not liable for use of the software, including billed phone calls.

Bundled articles can be incomplete or wrong versus https://fonio.info — trust the official app and docs if they disagree.

The goal: connect Claude, ChatGPT, or Cursor, then **configure a full paste-ready agent in chat**. fonio’s public API cannot create assistants, so this server generates a paste pack (prompt, start messages, knowledge Q&A, transfers, calendar, webhooks, technical/GDPR, phone, app checklist) and wraps the live public endpoints (API-key test, outbound calls, remote integration servers).

## What it can do

- Report whether a workspace API key is connected (\`get_connection_status\`)
- Build a full paste-ready assistant from a business description (\`build_assistant\`)
- Validate prompts against documented fonio rules (headings, If-Then, AI + recording disclosure)
- Draft knowledge-base Q&A from company facts
- Search and read fonio help-center articles (community snapshot)
- Return the public OpenAPI reference (outbound calls, API-key test, remote integration servers)
- Test a workspace API key
- Prepare and, after confirmation, trigger an outbound call from one of your imported / SIP numbers
- List, register, and delete remote integration servers that serve live manifests to fonio

## Authentication

Hosted Claude/ChatGPT: the HTTP MCP returns 401 without a Bearer token so the client starts **community MCP OAuth** (not fonio GmbH login). Open https://app.fonio.ai/login, copy a workspace key from https://app.fonio.ai/api-keys, paste it on this host. The host encrypts the key. It never collects your fonio password. Prefer self-hosting this repo if you do not want the operator to store that encrypted key.

Local stdio: set \`FONIO_API_KEY\`.

Outbound calls incur carrier cost, require the Teams plan, an imported or SIP number, and completed KYC. Prepare the call first, ask the user to confirm the exact destination, then pass the short-lived \`confirmationToken\` and the same E.164 value as \`confirmedToNumber\` to the trigger tool.

## Hosted HTTP vs local stdio

- HTTP (Claude, ChatGPT, Cursor): \`/mcp\` — requires the community connector + API key
- stdio (Claude Desktop): \`npm run mcp\` with FONIO_API_KEY in the client config (safest: key never leaves the machine)
`,
  },
  {
    slug: "build-assistant",
    title: "Build a fonio assistant with this MCP",
    summary:
      "How Claude uses templates, build_assistant, prompt validation, and knowledge Q&A — then you paste the spec into app.fonio.ai.",
    category: "API",
    url: "https://fonio.info/articles/how-to-write-a-great-prompt",
    tags: ["mcp", "prompt", "assistant", "templates", "knowledge"],
    body: `# Build a fonio assistant with this MCP

fonio has no public “create assistant” API. This community MCP therefore builds a **paste-ready spec** you drop into app.fonio.ai — the same job ElevenLabs MCP does when it can write agents directly.

## Flow

1. \`list_assistant_templates\` — receptionist, answering machine, appointment scheduling, first-level support, outbound callback, WhatsApp booking.
2. \`build_assistant\` — company, use case, languages, transfers, booking event, hours, facts.
3. \`validate_assistant_prompt\` — official headings, If/Then, AI + recording disclosure, ~300 word guide, 100k hard limit.
4. \`draft_knowledge_base\` — Q&A phrased the way callers ask. Facts stay here, not duplicated in the prompt.
5. Paste into Assistants → Create New. Enable the listed tools. Connect a number.

## App checklist (always)

- Name, start message, voice, language (Multi needs a multilingual voice: Anna, Sophie, Ben, Brian, plus Deepgram).
- Paste the prompt. The entire text is used — no comments.
- Knowledge → Information for Q&A. Enable Answer Questions on this assistant.
- Tools: transfers, Scheduler/Cal.com, email/SMS, HTTP as listed.
- Inbound: fonio number + carrier forwarding. Outbound: imported/SIP number, Teams, KYC.
- Test with real calls. Test Call cannot test forwarding.

Official templates live at https://fonio.info/articles/how-to-write-a-great-prompt (Role, Conversation flow, If / Then, Important rules; keep ~300 words). Multi does not auto-switch — see languages. There are two outbound API bodies — see outbound-api.
`,
  },
  {
    slug: "first-steps",
    title: "First Steps",
    summary:
      "Set up your first AI phone assistant: dashboard, greeting, knowledge, number, forwarding, email, prompt, SMS, calendar, and webhooks.",
    category: "Getting started",
    url: "https://fonio.info/articles/first-steps",
    tags: ["onboarding", "assistant", "quickstart"],
    body: `# First Steps

A complete walkthrough to set up your first AI phone assistant — from creating an agent to taking real calls. Video versions live in the Onboarding Academy at fonio.academy.

## 1. Home dashboard

After logging in to app.fonio.ai you see call history, SMS volume, and usage (minutes, numbers, users, concurrent calls).

## 2. Create your first assistant

Go to Assistants → Create New.

### Essentials

Set a short one-sentence greeting, then pick a voice. For a multilingual assistant, both the voice and the language must be set to Multi.

### Answer Questions

Open Answer Questions → Company Information, paste your website URL, and click Generate. fonio extracts services, opening hours, and FAQs from the site.

## 3. Connect a phone number

Add a fonio number, then forward your existing business number to it. A number added in fonio handles inbound calls only. For outbound you must import a number or create a SIP trunk. Check inbound/outbound status via the Usage icon on each number row.

## 4. Call forwarding (transfers)

Describe transfers as If → Then rules, e.g. "If the caller wants John Doe or invoicing, then forward here." SIP transfers need the SIP toggle and URL. The Test Call button cannot test forwarding — make a real phone call. International forwarding is under Technical → International call forwarding.

## 5. Send email after a call

Use Fixed Recipients for a static address, or Dynamic Recipients based on the conversation. Leave the condition empty to email after every call. If mail does not arrive, whitelist app@mail.fonio.com. Check Call History → Post-Call Actions.

## 6. Write a great prompt

A clear prompt is the difference between a robotic assistant and one that represents the business. See the Prompting article.

## 7. Send SMS after a call

Same pattern as email: yourself, the caller, or a specific recipient. Useful for confirmations and links.

## 8. Book appointments

Three options: fonio Scheduler (book / reschedule / cancel, public booking page), Cal.com, or Calendly. Scheduler: connect Microsoft or Google, customize the URL, add an event type, connect it to the assistant. If bookings fail, name the event in the prompt, e.g. "If you schedule an appointment, use the event Support."

## 9. API & Webhooks

Webhook and outbound API setups are covered in the API / Webhooks article and in academy videos.
`,
  },
  {
    slug: "prompting",
    title: "How to write a great prompt",
    summary:
      "Current fonio.info prompt guide: five rules, official copy-paste templates, ~300 word target, and hallucination guards.",
    category: "Assistants",
    url: "https://fonio.info/articles/how-to-write-a-great-prompt",
    tags: ["prompt", "handlebars", "templates", "if-then"],
    body: `# How to write a great prompt

Official guide: https://fonio.info/articles/how-to-write-a-great-prompt (last reviewed 2026-07-29)

The in-app prompt builder drafts a prompt — always review the Conversation flow. ChatGPT text prompts are written for chat, not phone calls; they often confuse a fonio assistant.

## The 5 rules

1. Start with who the assistant is (name, role, tone).
2. Use headers: \`## Role\`, \`## Conversation flow\`, \`## If / Then rules\`, \`## Important rules\`.
3. Write every decision as If / Then.
4. Tell it what TO do, not only what NOT to do.
5. Keep it under ~300 words. Longer prompts skip rules. The old 100,000-character platform limit still exists.

## Official copy-paste templates

https://fonio.info/articles/how-to-write-a-great-prompt/copy-paste-templates

- Answering machine
- Receptionist
- Appointment booking
- 1st level support

Paste into: Assistants → Custom Prompt / Instructions → Custom Prompts. Replace every \`[bracket]\` or the assistant will read it aloud.

## Prevent hallucinations

Facts (prices, hours, addresses) go in the knowledge base, not the prompt. Add: "For company-specific information, use only the stored knowledge base." Repeat prices and numbers verbatim. Do not volunteer employee personal data.

Integration WHEN-conditions live on the integration, not in the prompt.

## Language switch

https://fonio.info/articles/languages — Multi does **not** reliably auto-switch. Add: "If the caller speaks another language (e.g. English), switch completely to that language for the rest of the conversation." The start message is never translated.

## GDPR

Introduce as an AI and mention recording. Prefer automatic deletion if refused.

## Handlebars

\`{{name}}\`, \`{{#if}}\`, inbound webhook fields as \`{{variable}}\`, public outbound API as \`{{context.field}}\`, help-center Outbound API extra keys as \`{{first_name}}\`. After a call, inbound webhook fields are also \`{{inboundContext.field}}\`.
`,
  },
  {
    slug: "phone-numbers",
    title: "Phone numbers",
    summary:
      "fonio numbers (inbound), imported numbers (outbound), SIP, forwarding from your existing line, and carrier codes.",
    category: "Phone & calls",
    url: "https://fonio.info/articles/connect-number",
    tags: ["numbers", "sip", "forwarding", "import"],
    body: `# Phone Numbers

## Options

- **fonio numbers** — buy in the platform. Ready for inbound and testing. Included. Inbound only.
- **Import number** — your own number for outbound and brand-consistent caller ID. Teams plan. About €5 / month. Outbound only until configured.
- **SIP numbers** — connect an existing PBX. Included.
- **fonio PBX** — full phone system with team routing, voicemail, and a browser phone.

Shared fonio numbers do not support outgoing calls. Outgoing calls need an imported number or SIP.

## Keep your existing number

Most customers forward their existing number to a fonio number. Forwarding is configured at the carrier, router, or PBX — not inside fonio.

Mobile carrier codes (syntax can differ):

| Action | Activate | Deactivate |
| --- | --- | --- |
| Forward immediately | *21*fonio-number# | #21# |
| On no answer | *61*fonio-number# | #61# |
| On busy | *67*fonio-number# | #67# |
| Delete all | ##002# | — |

Test by calling your existing number from another phone. If the assistant does not answer, check fonio call history. No entry means the forwarding never reached fonio.

## Import a number (outbound)

Phone Numbers → Add Numbers → Import Number. Enter the number, complete the verification call (you will be asked to type a code). Error "This phone number has no outbound config set up" means import is incomplete.

## Inbound vs outbound assistants

On one number you can assign different assistants for incoming and outgoing calls: Phone Numbers → Change Assistant Assignment.

## Billing notes

Standard purchased numbers are typically €9 / month. Forwarding while a human is connected is billed per minute (see current pricing). Concurrent AI calls: up to 15, then a queue.
`,
  },
  {
    slug: "outbound-calls",
    title: "Outbound calls and campaigns",
    summary:
      "CSV campaigns, calling hours, KYC, imported numbers, and how campaign context reaches the assistant.",
    category: "Phone & calls",
    url: "https://fonio.info/articles/outbound-calls",
    tags: ["outbound", "campaign", "csv", "kyc"],
    body: `# Outbound calls

Two ways to place outbound calls: Outbound Campaign (CSV from the dashboard) and Outbound API (programmatic). Both require an imported or SIP number, the Teams plan, extra carrier cost, and KYC under Subscription & billing.

## Campaign overview

Upload a CSV, set hours, and fonio dials the list — reminders, follow-ups, announcements.

### CSV

Required column (exact name): \`phone_number\`

Numbers must be international with a + prefix. Spreadsheets often strip +. Prefix an apostrophe in the cell: \`'+\`43123456789

Optional columns (name, company, notes, …) become assistant context during the call.

### Campaign settings

Name, phone number, start time, calling hours (remaining calls resume the next day), interval between calls, contact list. Review the parse preview before Create Campaign.

### Monitor

See who was called, duration, result, transcript, and CSV context.

### Troubleshooting

- Calls don't start: number not outbound-enabled, or KYC incomplete
- Numbers not recognised: column not exactly phone_number, or missing +
- Campaign doesn't start: start time / CSV upload
`,
  },
  {
    slug: "outbound-api",
    title: "Outbound API",
    summary:
      "Two outbound APIs: public OpenAPI (camelCase + context) and the help-center assistant URL (snake_case + agent_id).",
    category: "API",
    url: "https://fonio.info/articles/outbound-calls/Outbound-API",
    tags: ["api", "outbound", "fromNumber", "context", "agent_id"],
    body: `# Outbound API

Help center: https://fonio.info/articles/outbound-calls/Outbound-API
Public OpenAPI: https://app.fonio.ai/api/docs

fonio currently documents **two request shapes**. This MCP’s \`trigger_outbound_call\` uses the public OpenAPI.

## A. Public REST (OpenAPI) — what this MCP calls

POST \`https://app.fonio.ai/api/public/v1/outbound_call\`

Auth: \`Authorization: Bearer <key>\` (or \`apiKey\` in the JSON body).

\`\`\`json
{
  "fromNumber": "+43123456789",
  "toNumber": "+4915123456789",
  "context": {
    "name": "Christian",
    "company": "Acme",
    "reason": "follow-up on the quote"
  }
}
\`\`\`

- \`fromNumber\` selects the outbound assistant assigned to that imported/SIP number.
- \`toNumber\` must match \`^\\+\\d+$\`.
- Extra fields go in \`context\` and appear in the prompt as \`{{context.name}}\`.

## B. Help-center Outbound API (assistant Webhooks)

Copy the URL from the assistant → Webhooks → Outbound API. Documented body:

\`\`\`json
{
  "api_key": "YOUR_API_KEY",
  "from_number": "+43123456789",
  "to_number": "+43198765432",
  "agent_id": "YOUR_AGENT_ID",
  "first_name": "Christian",
  "last_name": "Mueller",
  "email": "christian@example.com"
}
\`\`\`

Required: \`api_key\`, \`from_number\`, \`to_number\`, \`agent_id\`. Any extra keys become prompt variables (\`{{first_name}}\`). Variable names in the request must match the prompt.

## Shared requirements

Imported or SIP number, Teams plan, KYC under Subscription & billing, extra carrier cost. Shared fonio numbers cannot place outbound. Voicemail is detected and the call ends.

Prompt the outbound assistant for the purpose of the call and reference every variable you send.
`,
  },
  {
    slug: "api-webhooks",
    title: "API / Webhooks",
    summary:
      "Inbound webhook before the call, HTTP during the call, webhook after the call, inboundContext, and allowlisted source IPs.",
    category: "API",
    url: "https://fonio.info/articles/api-webhooks",
    tags: ["webhook", "inbound", "n8n", "make", "context"],
    body: `# API / Webhooks

fonio has three webhook timings: inbound (before the call), during the call, and after the call. Public REST API: https://app.fonio.ai/api/docs

Source IPs for fonio backend API requests (allowlist these):

- 128.140.42.143
- 128.140.34.113
- 167.233.91.1
- 167.233.75.149
- 178.105.222.76

## Inbound webhook (before the call)

Triggered for every incoming call with the calling number. Return JSON that the assistant can use as \`{{variable}}\` in the prompt and start message.

Example request body:

\`\`\`json
{ "fromNumber": "+4915123456789", "toNumber": "+49891234567" }
\`\`\`

Setup: assistant → Advanced capabilities → Webhooks → enable Inbound Webhook → paste your URL (Make, n8n, or your API). Respond with \`Content-Type: application/json\`. Browser tests cannot verify this — make a real call. Provide a fallback greeting if a field is missing.

### inboundContext

Values returned here stay unchanged for the whole session, including post-call HTTP: \`{{inboundContext.customerId}}\`. They are never rewritten by the LLM. Use this for IDs, contract status, and exact values. Extracted variables come from the conversation instead.

Typical Make/n8n flow: custom webhook → lookup by phone number → router found/not found → webhook response.

## During the call

Official: https://fonio.info/articles/api-webhooks/webhook-during-the-call

Two ways:

1. **Webhook during the call** (assistant → Webhooks): POST to your n8n/Make URL when a condition matches. Waiting message up to 5 seconds. Dynamic parameters are extracted from speech (describe the field, give the spoken format in the prompt, e.g. order numbers like BP20260001).
2. **HTTP Request integration** during the call: URL/method/headers/body. Response fields are read back automatically.

Typical flow: caller asks status → assistant asks for the ID in the documented format → webhook fires → n8n looks up a row → assistant reads product, date, status.

## After the call

Post-call HTTP, email, SMS, WhatsApp, or Sheets. Conditions live on the integration (Settings tab), not in the prompt. Post-processing runs once. Use \`{{inboundContext.*}}\` for deterministic inbound-webhook data and extracted custom fields for conversation data.
`,
  },
  {
    slug: "integrations",
    title: "Integrations",
    summary:
      "Shared setup for Email, SMS, HTTP, Search, and Google Sheets: Pre / During / After, variables, and workflow patterns.",
    category: "Integrations",
    url: "https://fonio.info/articles/integrations",
    tags: ["http", "email", "sms", "sheets", "search", "n8n"],
    body: `# Integrations

Open Integrations in the assistant. Every integration shares the same setup: activity (always / inside / outside opening hours), name, when it runs (Pre / During / After), then type-specific settings.

- Pre: before pickup. No conversation data yet — only caller number, agent number, timestamps.
- During: the assistant decides live from the Condition & Description (write a full If-Then sentence).
- After: condition is on the Settings tab, not in the prompt.

Opening hours are company-wide. You only choose whether this integration respects them.

## Recipients, content, variables

Static vs Prompt recipient. Template vs Prompt body. Click Add Variable for \`{{double curly braces}}\`. Custom variables: type \`{{anyName}}\`, pick String/Number/Boolean, and write a description (required to save). Variable extraction is no longer a central Technical tab — it lives on the integration that uses the value.

Do not extract what the system already knows. Caller number is \`{{personNumber}}\`. Conversation link is \`{{conversationLink}}\`.

Built-in variables: companyId, conversationId, conversationLink, agentNumber, personNumber, startTimestamp, direction, fonio.agent.name, fonio.company.name.

Optional spoken filler ("What to say while the call runs") covers 2–5 seconds of HTTP or search.

## HTTP Request

URL, method (GET/POST/PUT/PATCH/DELETE), headers, body. Drop variables into any of them. After substitution, headers and body must still be valid JSON — quote string variables.

During-call HTTP responses are available to the assistant automatically.

## Search Request

Live web search. Restrict to your domain. Write an If-Then condition. Set an execution sentence so the caller is not in silence.

## Google Sheets

Connect once. Read matching rows into the conversation, or append a row. Filters support $eq, $ne, $in, $regex, $gt.

## Email / SMS

SMS recipients: other participant (the caller), fixed number, or AI-determined. SMS add-on is billed separately (on the order of €0.15). Email sender name should be recognisable. Dynamic recipients route by topic.

## Make and n8n

Anything not native: HTTP Request to a Make/n8n webhook, then Slack, HubSpot, Salesforce, etc.

## Example workflow

1. Pre + Sheets Read — look up the caller by phone
2. During + HTTP — order status by ID
3. After + SMS — confirmation to the caller
4. After + Email — summary to a colleague
`,
  },
  {
    slug: "calendar",
    title: "Schedule appointments",
    summary:
      "fonio Scheduler vs Cal.com vs Calendly: event types, availability, SMS booking links, and prompt wording.",
    category: "Integrations",
    url: "https://fonio.info/articles/calendar",
    tags: ["calendar", "scheduler", "cal.com", "calendly", "booking"],
    body: `# Schedule Appointments

## Options

1. **fonio Scheduler** — book, reschedule, cancel; Google or Microsoft; public booking page; custom confirmation; included in subscriptions.
2. **Cal.com** — book only; many calendars; free. Requires a participant email (error-prone on the phone). If you do not want to collect email, use the fonio Scheduler.
3. **Calendly** — book only; needs a Calendly subscription.

## Scheduler setup

1. Connect Google or Microsoft (plan limits how many accounts).
2. Customize the public URL with your company name.
3. Event types: single or team; name, description, duration, location; data collection; availability; notifications.
4. Connect the event to an assistant. Put in the prompt: "Book an appointment in the event 'your event name' when someone requests it."

### Availability

This is not company opening hours. It is the real bookable schedule of the person: timezone, minimum notice, buffers, maximum window. If the assistant offers no slots, the schedule is too narrow or the calendar is full.

### Booking page

Guests can reschedule and/or cancel if you enable those capabilities. SMS booking-link fallback is an integration setting and needs the SMS add-on.

Collect phone number if callers should manage the appointment later via SMS.
`,
  },
  {
    slug: "knowledge-base",
    title: "Knowledge Base",
    summary:
      "Q&A entries, PDF sources, company information, live web search, per-assistant source toggles, and AI suggestions.",
    category: "Assistants",
    url: "https://fonio.info/articles/knowledge-base",
    tags: ["knowledge", "pdf", "search", "q&a"],
    body: `# Knowledge Base

The knowledge base is company-wide. Per assistant you choose which PDF sources it may use. Q&A entries always apply to every assistant — split knowledge with separate PDFs if you need isolation.

## Building blocks

| Block | Best for |
| --- | --- |
| Information (Q&A) | Recurring questions, short unambiguous answers |
| Sources (PDFs) | Policies, flyers, long documents — must be real text, not scans |
| Company Information | Address, team, services. Generate from your website then edit |
| Live web search | Info that changes often. Restrict to your domain |

Phrase Q&A questions the way callers ask. One question = one entry. fonio suggests new Q&A from PDFs and crawled sites under Knowledge → Information → Suggestions. Review and accept.

Per assistant: Edit Assistant → Behaviour → Answer Questions to enable PDF sources.

Live search: set a domain and an execution sentence ("One moment, let me check that for you."). Product numbers must be spoken in the indexed format.

Prompt vs knowledge: behaviour in the prompt, facts in the knowledge base. If the assistant ignores knowledge, check source enablement, wording vs how callers ask, and that the prompt tells it to use the knowledge base.
`,
  },
  {
    slug: "technical",
    title: "Technical settings",
    summary:
      "Call duration, waiting time, speech speed, interrupt sensitivity, creativity, accurate information processing, and recordings.",
    category: "Assistants",
    url: "https://fonio.info/articles/technical",
    tags: ["technical", "audio", "recording", "temperature"],
    body: `# Technical

## Call settings

- Maximum call duration — cap cost; base it on typical calls plus a buffer.
- Maximum waiting time — silence timeout before the AI hangs up.

## Audio

- Speech speed — tempo of spoken replies, not latency.
- Sensitivity — how easily the AI is interrupted. Lower it in noisy environments (construction). Raise it for quiet, elderly callers. Interruptions can also be disabled entirely.

## Information processing

Creativity (temperature): low for prices, hours, booking; medium for friendly structured talk; high only when you want improvisation.

Accurate information processing: briefly switches to a slower, stronger model for emails, phone numbers, customer numbers. Add example formats. Test with Test audio.

## Recordings

Record audio: files available ~30 days. Regardless of this toggle, the assistant must tell callers the call is recorded — otherwise AI calls are not possible.

Automatic deletion (recommended): if the person rejects recording, audio and transcript are deleted and post-processing does not run. Prompt: end or transfer if recording is refused.

Specialized terms (product names, streets, employee names) live under Technical → Audio → Specialized terms.
`,
  },
  {
    slug: "whatsapp",
    title: "WhatsApp",
    summary:
      "WhatsApp Business assistants, appointment booking in chat, human takeover, and common Meta connection errors.",
    category: "Product",
    url: "https://fonio.info/articles/whatsapp",
    tags: ["whatsapp", "chat", "waba"],
    body: `# WhatsApp

Create a WhatsApp Assistant (same knowledge base, hours, formality as voice). Connect Scheduler or Cal.com. HTTP and Slack integrations work in chat too.

## Setup

1. Create assistant → WhatsApp Assistant
2. Name, language, duration, knowledge, prompt (use a template)
3. Test Chat
4. Activate: fonio number or private number → connect WhatsApp Business Account → connect phone number → start message → copy the WhatsApp link
5. Text the number or share the link. Manage profiles under Manage Number Profiles.
6. Take over any conversation from the inbox and type as a human.

## Errors

- Too many numbers on the WABA: unverified Meta accounts allow one number. Verify the business, wait after deletions.
- Number in use elsewhere: release it from the other WABA or WhatsApp app.
- Two-step PIN mismatch after re-adding a number: disable 2FA for that number in WhatsApp Manager.

Human handover rules (billing, refunds, …) can force a person and notify the unified inbox. Post-call WhatsApp alerts to your team are available (internal, not customer-facing, early access via support@fonio.ai).
`,
  },
  {
    slug: "variables",
    title: "Variables and context",
    summary:
      "Built-in call variables, custom extraction, inboundContext vs context from the outbound API, and Handlebars.",
    category: "API",
    url: "https://fonio.info/articles/integrations",
    tags: ["variables", "handlebars", "context", "extraction"],
    body: `# Variables and context

## Built-in (every call)

{{companyId}}, {{conversationId}}, {{conversationLink}}, {{agentNumber}}, {{personNumber}}, {{startTimestamp}}, {{direction}}, {{fonio.agent.name}}, {{fonio.company.name}}, plus {{plainTranscript}}, {{disconnectReason}}, {{audioLink}} where post-processing supports them.

## Custom

Type \`{{anyName}}\` in an integration field, set type and a description. The assistant extracts it from the conversation. Do not extract personNumber or conversationLink.

## Inbound webhook

Returned JSON fields: \`{{name}}\` in the prompt. After the call: \`{{inboundContext.name}}\`. Never rewritten by the model.

## Outbound API / campaign CSV

Extra columns and the \`context\` object: \`{{context.fieldName}}\`.

## Handlebars

Object paths, \`{{#if}}\` / \`{{else}}\` / \`{{/if}}\`, loops. Start messages can differ for inbound vs outbound.

A variable cannot toggle opening hours or forwarding rules. Forwarding conditions may mention something the caller said, but routing stays configured.
`,
  },
  {
    slug: "languages",
    title: "Languages & multilingual calls",
    summary:
      "Language and voice in Essentials. Multi does not auto-switch — put an If/Then in the prompt. The start message is never translated.",
    category: "Assistants",
    url: "https://fonio.info/articles/languages",
    tags: ["languages", "multi", "voice", "gdpr"],
    body: `# Languages & multilingual calls

Official: https://fonio.info/articles/languages (last reviewed 2026-07-29)

Set language and voice in the assistant’s basic settings. That language is the default spoken language.

## Multi does not auto-switch

The assistant does NOT reliably switch language mid-call on its own — not even with a multilingual setting. You must allow the switch in the prompt:

\`\`\`
If the caller speaks another language (e.g. English), switch completely to that language for the rest of the conversation — including follow-up questions and the goodbye.
\`\`\`

Use a neutral / multilingual voice so every language sounds natural.

## Start message is never translated

It is always read exactly as written. Keep it short and neutral (greeting + company). Then the assistant can switch per the prompt.

Waiting messages for integrations are also not auto-translated — write them in the callers’ language. Account UI language is Settings → Account → Language.
`,
  },
  {
    slug: "webchat",
    title: "Webchat",
    summary:
      "Chat assistant as a website widget or hosted link, SDK methods, human handover, and a GDPR privacy template.",
    category: "Product",
    url: "https://fonio.info/articles/webchat",
    tags: ["webchat", "widget", "sdk", "chat"],
    body: `# Webchat

Official: https://fonio.info/articles/webchat

Create a Chat assistant (same family as WhatsApp), then Set up Webchat: website widget or hosted link.

Essentials: name, language, formality (formal / informal / custom via prompt), conversation timeout.

Answer Questions can live-read allowed website URLs. Conversation Handling: AI, team, or a condition. Enable human handover with written conditions. Custom prompt can also trigger handover — keep conditions consistent.

Calendars: Scheduler or Cal.com. Webhooks and integrations work in chat. Test with Test chat.

Widget: colours, position, greeting. Paste the script before \`</body>\`. SDK after load:

- window.fonio.webchat.open()
- close() / toggle() / show() / hide()
- startNewConversation()

Include a Webchat section in the site privacy notice (fonio as processor). A sample GDPR template is on the article.
`,
  },
  {
    slug: "faq",
    title: "Frequently asked questions",
    summary:
      "Numbers, forwarding, languages, API, calendars, GDPR, prompt limits, and outbound behaviour.",
    category: "Getting started",
    url: "https://fonio.info",
    tags: ["faq", "gdpr", "languages", "pricing"],
    body: `# FAQ

Support: support@fonio.ai. Data is stored on EU servers (Hetzner, Nuremberg).

## Numbers & forwarding

- Keep your number via forwarding or SIP. Classic porting is limited; SIP is the bring-your-own path.
- Default purchased area codes: DE +49 30 (Berlin), AT +43 720. Other countries include IT, FR, UK, CH, PL, NL, US.
- The AI can forward; configure targets under Tools → Forwarding and describe If-Then in the prompt. It waits ~30 seconds, then returns to the caller. Forwarding ~€0.06 / min (confirm current pricing).
- Avoid loops: do not forward the assistant's number back into the same PBX that forwards to fonio.
- Pass the original caller as fromNumber when integrating.

## Assistants

Create as many as you want (free). Duplicate from the overview. Use several when use cases do not overlap. Assign inbound vs outbound assistants per number. Select the outbound assistant via fromNumber on the API.

## Languages

Multilingual mode switches mid-call when both voice and language are Multi. All listed languages are included. Introduce the assistant as AI and mention recording.

## API & automation

Open API plus webhooks. Recommended automation: n8n (also Make). No native HubSpot; connect via HTTP/n8n. During-call HTTP can read order status aloud.

## Calendar

Native: fonio Scheduler, Cal.com, Calendly. Google and Microsoft 365 for Scheduler. Email is not required for Scheduler bookings (SMS confirmation works).

## GDPR

Inform that it is an AI and that the call is recorded. If refused, use automatic deletion. Transcripts typically ~30 days. AVV is in the terms.

## Limits

Prompt up to 100,000 characters (~20 pages). Knowledge base PDFs have been tested above 300 pages. Up to 15 parallel AI calls, then queue. SMS extra. Number ~€9 / month.

## Outbound

Yes, including API-triggered calls from a form. Voicemail is detected and the call ends. KYC required.
`,
  },
];

const STOP = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "your",
  "you",
  "is",
  "are",
  "be",
  "it",
  "this",
  "that",
  "from",
]);

export function getArticle(slug: string): DocArticle | undefined {
  const key = slug.trim().toLowerCase();
  return articles.find((article) => article.slug === key);
}

export function listArticles(): Pick<
  DocArticle,
  "slug" | "title" | "summary" | "category" | "url" | "tags"
>[] {
  return articles.map((article) => ({
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    category: article.category,
    url: article.url,
    tags: article.tags,
  }));
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#{}._-]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOP.has(token));
}

export type DocHit = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  url: string;
  score: number;
  excerpt: string;
};

function excerptAround(body: string, terms: string[]): string {
  const lower = body.toLowerCase();
  for (const term of terms) {
    const index = lower.indexOf(term);
    if (index >= 0) {
      const start = Math.max(0, index - 80);
      const end = Math.min(body.length, index + term.length + 160);
      const slice = body.slice(start, end).replace(/\s+/g, " ").trim();
      return `${start > 0 ? "…" : ""}${slice}${end < body.length ? "…" : ""}`;
    }
  }
  return body.replace(/\s+/g, " ").trim().slice(0, 220);
}

export function searchDocs(query: string, limit = 6): DocHit[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  const hits: DocHit[] = [];
  for (const article of articles) {
    const hayTitle = tokenize(article.title);
    const hayTags = article.tags.map((tag) => tag.toLowerCase());
    const hayBody = tokenize(`${article.summary} ${article.body} ${article.category}`);
    let score = 0;
    for (const term of terms) {
      if (article.slug === term) score += 12;
      if (hayTitle.includes(term)) score += 8;
      if (hayTags.some((tag) => tag === term || tag.includes(term))) score += 5;
      const bodyHits = hayBody.filter((token) => token === term || token.includes(term)).length;
      score += Math.min(bodyHits, 8);
    }
    if (score > 0) {
      hits.push({
        slug: article.slug,
        title: article.title,
        summary: article.summary,
        category: article.category,
        url: article.url,
        score,
        excerpt: excerptAround(`${article.summary}\n${article.body}`, terms),
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, Math.max(1, limit));
}
