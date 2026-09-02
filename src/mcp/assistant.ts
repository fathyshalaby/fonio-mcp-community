export const PROMPT_CHARACTER_LIMIT = 100_000;

export type AssistantChannel = "voice" | "whatsapp";
export type AssistantDirection = "inbound" | "outbound" | "both";
export type AssistantTemplateSlug =
  | "receptionist"
  | "answering_machine"
  | "appointment_scheduling"
  | "first_level_support"
  | "outbound_callback"
  | "whatsapp_booking";

export type AssistantTemplate = {
  slug: AssistantTemplateSlug;
  title: string;
  summary: string;
  channel: AssistantChannel;
  direction: AssistantDirection;
  defaultVoice: string;
  goal: string;
  toolsToEnable: string[];
  extraIfThen: string[];
};

export type KnowledgeEntry = {
  question: string;
  answer: string;
};

export type PromptIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
};

export type BuildAssistantInput = {
  company: string;
  useCase: string;
  template?: AssistantTemplateSlug | string;
  assistantName?: string;
  languages?: string;
  transferTargets?: string;
  bookingEvent?: string;
  channel?: AssistantChannel | string;
  direction?: AssistantDirection | string;
  companyFacts?: string;
  formality?: string;
  hours?: string;
};

export const ASSISTANT_TEMPLATES: AssistantTemplate[] = [
  {
    slug: "receptionist",
    title: "Receptionist",
    summary:
      "Greet callers, answer routine questions from the knowledge base, book in a named Scheduler event, and transfer named topics to people.",
    channel: "voice",
    direction: "inbound",
    defaultVoice: "Anna",
    goal: "identify the caller’s request, resolve what you can, book or transfer the rest",
    toolsToEnable: [
      "Call transfer (named targets)",
      "fonio Scheduler or Cal.com event connected to this assistant",
      "After-call email to a fixed recipient",
      "Answer Questions → knowledge base",
    ],
    extraIfThen: [
      "If the caller wants to book or reschedule, then book in the named Scheduler event and confirm the slot out loud.",
      "If the caller asks for a named person or a topic that has a transfer target, then transfer after a one-sentence recap.",
    ],
  },
  {
    slug: "answering_machine",
    title: "Intelligent answering machine",
    summary:
      "After-hours or overflow: capture the concern and a callback number, do not debate the content, then end politely.",
    channel: "voice",
    direction: "inbound",
    defaultVoice: "Sophie",
    goal: "take a complete message (name, callback number, concern) so a human can call back",
    toolsToEnable: [
      "After-call email with {{plainTranscript}} to a fixed inbox",
      "Optional SMS confirmation to the caller",
    ],
    extraIfThen: [
      "If the caller already stated their concern, confirm it in one sentence and do not ask content questions.",
      "If they cannot be reached on the current number, ask for an alternative callback number.",
      "If they want a live person and a transfer target exists, transfer; otherwise take the message.",
    ],
  },
  {
    slug: "appointment_scheduling",
    title: "Appointment scheduling",
    summary:
      "One job: find a slot, book/reschedule/cancel in a named calendar event, and send a confirmation.",
    channel: "voice",
    direction: "inbound",
    defaultVoice: "Anna",
    goal: "book, reschedule, or cancel in the named calendar event",
    toolsToEnable: [
      "fonio Scheduler (preferred if you do not want to collect email) or Cal.com / Calendly",
      "SMS booking-link fallback if the SMS add-on is enabled",
      "After-call email or SMS confirmation",
    ],
    extraIfThen: [
      "If they want a new appointment, then offer slots from the named event and book only after they confirm a time.",
      "If they want to reschedule or cancel, then identify the existing booking (phone number or name) and use the event’s reschedule/cancel capability.",
      "If no slots exist, say so and offer a callback instead of inventing availability.",
    ],
  },
  {
    slug: "first_level_support",
    title: "First-level support",
    summary:
      "Triage, look up order/account status via HTTP when configured, solve documented issues, escalate the rest.",
    channel: "voice",
    direction: "inbound",
    defaultVoice: "Ben",
    goal: "solve documented issues, collect IDs, and escalate anything that needs a human",
    toolsToEnable: [
      "During-call HTTP Request for order/account lookup",
      "Call transfer for billing, complaints, and anything off-script",
      "After-call email or ticket webhook",
      "Knowledge base Q&A for how-to answers",
    ],
    extraIfThen: [
      "If they have an order, ticket, or customer number, collect it (expected format in the prompt) before looking it up.",
      "If the HTTP lookup returns a status, read the relevant fields back; do not invent a status.",
      "If they are angry, ask for a refund, or the issue is not in the knowledge base, transfer.",
    ],
  },
  {
    slug: "outbound_callback",
    title: "Outbound lead callback",
    summary:
      "You are calling them. Use {{context.*}} from the outbound API or campaign CSV. Qualify and optionally book.",
    channel: "voice",
    direction: "outbound",
    defaultVoice: "Brian",
    goal: "confirm you reached the right person, qualify the lead, and book or take a next step",
    toolsToEnable: [
      "Imported or SIP fromNumber assigned to this outbound assistant",
      "Teams plan + KYC",
      "fonio Scheduler event if you want to book live",
      "After-call email to sales",
    ],
    extraIfThen: [
      "If voicemail is detected, hang up — fonio already ends voicemail calls; do not leave a looping message.",
      "If they are not the right person, apologise and end.",
      "If they agree to a meeting, book the named event or take three time windows.",
    ],
  },
  {
    slug: "whatsapp_booking",
    title: "WhatsApp booking assistant",
    summary:
      "Same knowledge and hours as voice, but in WhatsApp chat. Keep turns short; offer a booking link if live slots fail.",
    channel: "whatsapp",
    direction: "inbound",
    defaultVoice: "Anna",
    goal: "answer in chat and book, reschedule, or cancel in the named event",
    toolsToEnable: [
      "WhatsApp Assistant connected to a WABA number",
      "Scheduler or Cal.com",
      "Human takeover from the unified inbox for billing/refunds",
    ],
    extraIfThen: [
      "If they want to book, then book in the named event or send the public booking page.",
      "If they ask for a human, then stop and leave the conversation for inbox takeover.",
    ],
  },
];

export const VOICES = [
  {
    name: "Anna",
    gender: "female",
    multilingualCapable: true,
    gdprNote:
      "Named in fonio FAQ as a multilingual-capable voice. Language is NOT switched automatically — even with Multi you must add an If/Then switch in the prompt (fonio.info/articles/languages).",
  },
  {
    name: "Sophie",
    gender: "female",
    multilingualCapable: true,
    gdprNote:
      "Named in fonio FAQ as a multilingual-capable voice. Language is NOT switched automatically — even with Multi you must add an If/Then switch in the prompt (fonio.info/articles/languages).",
  },
  {
    name: "Ben",
    gender: "male",
    multilingualCapable: true,
    gdprNote:
      "Named in fonio FAQ as a multilingual-capable voice. Language is NOT switched automatically — even with Multi you must add an If/Then switch in the prompt (fonio.info/articles/languages).",
  },
  {
    name: "Brian",
    gender: "male",
    multilingualCapable: true,
    gdprNote:
      "Named in fonio FAQ as a multilingual-capable voice. Language is NOT switched automatically — even with Multi you must add an If/Then switch in the prompt (fonio.info/articles/languages).",
  },
  {
    name: "Maria",
    gender: "female",
    multilingualCapable: false,
    gdprNote:
      "FAQ: GDPR depends on the voice provider. Azure voices hosted in Europe are treated as GDPR-compliant; ElevenLabs voices are not yet.",
  },
] as const;

export const LANGUAGE_NOTES = [
  {
    id: "single",
    label: "Single language",
    detail:
      "Pick the caller’s language in assistant Essentials. The start message is never translated — keep it short and neutral.",
  },
  {
    id: "multi",
    label: "Multi (does not auto-switch)",
    detail:
      "fonio.info/articles/languages: the assistant does NOT reliably switch mid-call on its own, even with a multilingual setting. Pick a neutral/multilingual voice, set language to Multi, AND add an explicit If/Then in the prompt. Waiting messages are also not auto-translated.",
  },
] as const;

export function listAssistantTemplates() {
  return ASSISTANT_TEMPLATES.map((template) => ({
    slug: template.slug,
    title: template.title,
    summary: template.summary,
    channel: template.channel,
    direction: template.direction,
    defaultVoice: template.defaultVoice,
    toolsToEnable: template.toolsToEnable,
    officialTemplate: OFFICIAL_TEMPLATE_URL[template.slug] ?? null,
  }));
}

export function getAssistantTemplate(
  slug?: string,
): AssistantTemplate | undefined {
  if (!slug) return undefined;
  const key = slug.trim().toLowerCase().replace(/[\s-]+/g, "_");
  return ASSISTANT_TEMPLATES.find((template) => template.slug === key);
}

export function inferTemplate(
  useCase: string,
  channel?: string,
): AssistantTemplate {
  const text = `${channel ?? ""} ${useCase}`.toLowerCase();
  if (/\bwhats?app\b/.test(text)) return getAssistantTemplate("whatsapp_booking")!;
  if (/\b(outbound|callback|lead|form[- ]to[- ]call|campaign)\b/.test(text)) {
    return getAssistantTemplate("outbound_callback")!;
  }
  if (/\b(voicemail|answering machine|after[- ]hours|overflow)\b/.test(text)) {
    return getAssistantTemplate("answering_machine")!;
  }
  if (/\b(support|helpdesk|ticket|order status|first[- ]level)\b/.test(text)) {
    return getAssistantTemplate("first_level_support")!;
  }
  if (/\b(receptionist|reception|front desk|greeting)\b/.test(text)) {
    return getAssistantTemplate("receptionist")!;
  }
  if (/\b(book|appointment|calendar|scheduler|reschedule)\b/.test(text)) {
    return getAssistantTemplate("appointment_scheduling")!;
  }
  return getAssistantTemplate("receptionist")!;
}

export function listVoicesAndLanguages() {
  return {
    limitation:
      "fonio has no public voice-list API. This catalog is the multilingual voices named in the official FAQ, plus GDPR notes. Always pick the live voice in app.fonio.ai → Technical → Voice & language.",
    voices: VOICES,
    languages: LANGUAGE_NOTES,
    gdpr: {
      recording:
        "Regardless of the Record audio toggle, the assistant must tell callers it is an AI and that the call is recorded.",
      providers:
        "FAQ: Azure voices in Europe are treated as GDPR-compliant; ElevenLabs voices are not yet. Confirm the current provider badge in the app.",
    },
  };
}

function looksGerman(text: string): boolean {
  return /\b(german|deutsch|sie|du|vienna|wien|berlin|munich|münchen|austria|österreich|praxis|gmbh)\b/i.test(
    text,
  );
}

function defaultName(channel: AssistantChannel, german: boolean): string {
  if (channel === "whatsapp") return german ? "Lena" : "Lena";
  return german ? "Marie" : "Marie";
}

export function draftKnowledgeBase(input: {
  company: string;
  facts?: string;
  hours?: string;
  language?: string;
}): KnowledgeEntry[] {
  const german = looksGerman(`${input.language ?? ""} ${input.facts ?? ""} ${input.company}`);
  const entries: KnowledgeEntry[] = [];
  const seen = new Set<string>();

  function add(question: string, answer: string) {
    const key = question.trim().toLowerCase();
    if (!key || !answer.trim() || seen.has(key)) return;
    seen.add(key);
    entries.push({ question: question.trim(), answer: answer.trim() });
  }

  if (input.hours?.trim()) {
    add(
      german ? "Wann habt ihr geöffnet?" : "What are your opening hours?",
      input.hours.trim(),
    );
  }

  const facts = (input.facts ?? "").trim();
  if (facts) {
    const chunks = facts
      .split(/\n+|;\s+/)
      .map((chunk) => chunk.replace(/^[-*]\s+/, "").trim())
      .filter(Boolean);

    for (const chunk of chunks) {
      const qa = chunk.match(/^(?:q(?:uestion)?\s*[:.-]\s*)?(.+\?)\s*(?:a(?:nswer)?\s*[:.-]\s*)?(.+)$/i);
      if (qa) {
        add(qa[1]!, qa[2]!);
        continue;
      }
      const split = chunk.split(/\s+[—–-]\s+|:\s+/);
      if (split.length >= 2 && split[0] && split[0].length < 80) {
        const question = split[0].endsWith("?") ? split[0] : `${split[0].trim()}?`;
        add(question, split.slice(1).join(": "));
        continue;
      }
      if (/hour|open|öffn/i.test(chunk)) {
        add(
          german ? "Wann habt ihr geöffnet?" : "What are your opening hours?",
          chunk,
        );
      } else if (/park/i.test(chunk)) {
        add(german ? "Gibt es Parkplätze?" : "Do you have parking?", chunk);
      } else if (/address|adresse|located|sitz/i.test(chunk)) {
        add(german ? "Wo seid ihr?" : "Where are you located?", chunk);
      } else {
        add(
          german
            ? `Was sollte ich über ${input.company} wissen: ${chunk.slice(0, 48)}?`
            : `What should callers know: ${chunk.slice(0, 48)}?`,
          chunk,
        );
      }
    }
  }

  if (entries.length === 0) {
    add(
      german
        ? `Wobei kann ${input.company} helfen?`
        : `What does ${input.company} help with?`,
      german
        ? `Kurzbeschreibung ergänzen — Fakten gehören in die Knowledge Base, nicht doppelt in den Prompt.`
        : `Add a one-line description. Facts belong in the knowledge base, not duplicated in the prompt.`,
    );
  }

  return entries.slice(0, 16);
}

export function validateAssistantPrompt(prompt: string): {
  ok: boolean;
  characterCount: number;
  limit: number;
  issues: PromptIssue[];
} {
  const text = prompt ?? "";
  const issues: PromptIssue[] = [];
  const lower = text.toLowerCase();

  if (text.length > PROMPT_CHARACTER_LIMIT) {
    issues.push({
      severity: "error",
      code: "character_limit",
      message: `Prompt is ${text.length} characters; fonio allows ${PROMPT_CHARACTER_LIMIT}.`,
    });
  }
  if (text.trim().length < 120) {
    issues.push({
      severity: "error",
      code: "too_short",
      message: "Prompt is too short to act as a production script. Add flow, if-then rules, and an escape hatch.",
    });
  }
  if (!/^#{1,6}\s+/m.test(text)) {
    issues.push({
      severity: "error",
      code: "headings",
      message: "Use Markdown headings (`## Role`, `## Conversation flow`, `## If / Then rules`) so fonio can follow sections. `#` is a heading, not a comment.",
    });
  }
  if (!/\bif\b[\s\S]{0,120}\bthen\b/i.test(text) && !/if\s*\/\s*then/i.test(text) && !/if-then/i.test(text) && !/→/.test(text)) {
    issues.push({
      severity: "error",
      code: "if_then",
      message: "Add If / Then rules for the main paths (book, transfer, unclear request, recording refused). Official templates: fonio.info/articles/how-to-write-a-great-prompt",
    });
  }
  if (!/\b(ai|künstliche intelligenz|ki-telefon|telephone assistant|whatsapp assistant|virtual (receptionist|assistant))\b/i.test(text)) {
    issues.push({
      severity: "error",
      code: "ai_disclosure",
      message: "The assistant must introduce itself as an AI (GDPR / EU AI Act).",
    });
  }
  if (!/\b(record|recorded|aufnahme|aufgezeichnet)\b/i.test(text)) {
    issues.push({
      severity: "error",
      code: "recording_disclosure",
      message: "Tell the caller the call is recorded. Without this, AI calls are not possible.",
    });
  }
  if (!/\b(escape|cannot assist|nicht (helfen|unterstützen)|unclear|others|callback|nachricht|get back|colleague)\b/i.test(text)) {
    issues.push({
      severity: "error",
      code: "escape_hatch",
      message: "Give an escape hatch when the request is unclear or off-script (message, transfer, or polite end).",
    });
  }
  if (!/\bknowledge base\b/i.test(text) && !/\bwissensdatenbank\b/i.test(text)) {
    issues.push({
      severity: "warning",
      code: "knowledge_base",
      message: 'Put a line like: "For company-specific information, use only the stored knowledge base." Keep facts out of the prompt.',
    });
  }
  if (!/\b(legal|medizin|medical|politic|religion|sensitiv)\b/i.test(text)) {
    issues.push({
      severity: "warning",
      code: "sensitive_topics",
      message: "List sensitive topics the assistant must refuse (legal, medical advice, politics, religion).",
    });
  }
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount > 350) {
    issues.push({
      severity: "warning",
      code: "length_guide",
      message: `Current prompt guide on fonio.info says keep it under ~300 words (this draft is ${wordCount}). The hard platform limit is still ${PROMPT_CHARACTER_LIMIT} characters.`,
    });
  }
  if (/\b(todo|fixme|ignore this|comment:)\b/i.test(text)) {
    issues.push({
      severity: "warning",
      code: "comments",
      message: "The entire prompt is used. Do not leave comments for yourself.",
    });
  }
  if (lower.includes("{{context.") === false && /outbound/i.test(text)) {
    issues.push({
      severity: "warning",
      code: "outbound_context",
      message: "Outbound prompts should read {{context.field}} for CSV/API variables.",
    });
  }

  return {
    ok: issues.every((issue) => issue.severity !== "error"),
    characterCount: text.length,
    limit: PROMPT_CHARACTER_LIMIT,
    issues,
  };
}

function recommendVoice(template: AssistantTemplate, languages: string): string {
  if (/\bmulti\b/i.test(languages)) return template.defaultVoice;
  return template.defaultVoice;
}

function languageSetting(languages: string): { appValue: string; promptLine: string } {
  const raw = languages.trim() || "match the business";
  if (/\bmulti\b/i.test(raw)) {
    return {
      appValue: "Multi + a neutral/multilingual voice. Prompt must allow the switch — it is not automatic.",
      promptLine:
        "If the caller speaks another language (e.g. English), switch completely to that language for the rest of the conversation — including follow-up questions and the goodbye.",
    };
  }
  return {
    appValue: raw,
    promptLine: `Speak ${raw}.`,
  };
}

const OFFICIAL_TEMPLATE_URL: Record<string, string> = {
  receptionist: "https://fonio.info/articles/how-to-write-a-great-prompt/receptionist",
  answering_machine: "https://fonio.info/articles/how-to-write-a-great-prompt/answering-machine",
  appointment_scheduling: "https://fonio.info/articles/how-to-write-a-great-prompt/appointment-booking",
  first_level_support: "https://fonio.info/articles/how-to-write-a-great-prompt/first-level-support",
};

function officialCore(slug: AssistantTemplateSlug, name: string, company: string): string | undefined {
  if (slug === "receptionist") {
    return `## Role
You are ${name}, the virtual receptionist for ${company}. You speak in a friendly, professional tone.

## Conversation flow
1. Greet the caller and introduce yourself.
2. Ask how you can help.
3. Decide based on the request:
   - General question → answer using the knowledge base.
   - Wants to speak to a specific person → transfer the call.
   - Wants an appointment → start the booking flow.
4. End the call politely.

## If / Then rules
If you don't know the answer → say: "I'll have a colleague get back to you" and take their name + phone number.

## Important rules
- Never invent information that is not in the knowledge base.
- Always confirm phone numbers digit by digit.
- Keep replies short — under 2 sentences if possible.`;
  }
  if (slug === "answering_machine") {
    return `## Role
You are ${name}, the virtual assistant for ${company}. You speak in a friendly, helpful tone.

## Conversation flow
1. Greet the caller warmly and introduce yourself.
2. Ask for their first name. Confirm it.
3. Ask for their last name. Confirm it.
4. Ask what their call is about — in one sentence.
5. Say: "Thank you — someone will call you back within 24 hours."
6. End the call politely.

## If / Then rules
If the caller says it is urgent → note this and say a colleague will call back as soon as possible.
If asked about prices → say: "I'll have a colleague send you our pricing by email."

## Important rules
- Always confirm the caller's name before ending the call.
- Do not make any commitments on behalf of the team.`;
  }
  if (slug === "appointment_scheduling") {
    return `## Role
You are ${name}, the booking assistant for ${company}. You speak in a friendly, efficient tone.

## Conversation flow
1. Greet the caller and ask what kind of appointment they need.
2. Ask for their first and last name. Confirm.
3. Ask for their phone number. Read it back digit by digit to confirm.
4. Offer the next available slots from the calendar.
5. Once a slot is chosen, confirm: date, time, name.
6. Send a confirmation by SMS / email.
7. End the call politely.

## If / Then rules
If the caller wants a slot that is not available → offer the two closest alternatives.
If the caller wants to reschedule → ask for their name and existing appointment date, then move it.
If the caller wants to cancel → ask for their name and date, then cancel and confirm.

## Important rules
- Never double-book a slot.
- Always read phone numbers and email addresses back to confirm.`;
  }
  if (slug === "first_level_support") {
    return `## Role
You are ${name}, the first-level support assistant for ${company}. You speak in a calm, helpful tone.

## Conversation flow
1. Greet the caller and ask how you can help.
2. Let them describe the problem in their own words. Listen first.
3. Ask up to 2 clarifying questions to narrow it down.
4. Look up the answer in the knowledge base.
5. Explain the fix in simple steps.
6. Confirm the issue is solved. If not → escalate.

## If / Then rules
If the issue matches a known article → walk the caller through the steps.
If the caller is frustrated → acknowledge the frustration, then continue.
If the issue cannot be solved in 1 call → create a ticket with: name, phone number, short problem description, and say a specialist will call back within 24 hours.
If the caller asks about billing → take a callback request or transfer if a billing number is configured.

## Important rules
- Never guess. If unsure, say so and take a callback request.
- Stay calm, even if the caller is not.
- Keep technical language to a minimum.`;
  }
  return undefined;
}

export function buildAssistantPrompt(input: {
  template: AssistantTemplate;
  name: string;
  german: boolean;
  company: string;
  useCase: string;
  languages?: string;
  transferTargets?: string;
  bookingEvent?: string;
  formality?: string;
  hours?: string;
  direction?: string;
}): string {
  const { template, name, company, useCase } = input;
  const languages = languageSetting(input.languages ?? (input.german ? "German" : "English"));
  const event = input.bookingEvent?.trim();
  const transfers = input.transferTargets?.trim();
  const hours = input.hours?.trim();
  const outbound = template.direction === "outbound" || input.direction === "outbound";
  const channel = template.channel === "whatsapp" ? "WhatsApp" : "telephone";

  const extras: string[] = [];
  if (transfers) extras.push(`If the caller matches these transfer rules → transfer: ${transfers}.`);
  if (event) extras.push(`If you schedule an appointment → use the event “${event}”.`);
  if (hours) extras.push(`If they ask whether you are open → use only the knowledge base (hours: ${hours}).`);
  extras.push("If the caller refuses recording → end or transfer so automatic deletion can run.");

  const core =
    officialCore(template.slug, name, company) ??
    `## Role
You are ${name}, the ${channel} assistant for ${company}. Use case: ${useCase}.

## Conversation flow
1. Greet the caller and introduce yourself.
2. Ask how you can help.
3. Complete the goal: ${template.goal}.
4. End politely.

## If / Then rules
If the request is unclear → ask one follow-up question.

## Important rules
- Never invent facts that are not in the knowledge base.
- Keep replies short.`;

  const withExtras = extras.length
    ? core.replace("## Important rules", `${extras.map((line) => (line.startsWith("If ") ? line : `If ${line}`)).join("\n")}\n\n## Important rules`)
    : core;

  const languageBlock = /\bmulti\b/i.test(input.languages ?? "")
    ? `\n${languages.promptLine}\n`
    : "";

  const outboundBlock = outbound
    ? `
## Outbound context
You placed this call. Use only fields you actually received (public API: {{context.name}}, {{context.reason}}; help-center Outbound API: {{first_name}}, {{email}}). Never invent a name or reason.
`
    : "";

  const recording =
    template.channel === "whatsapp"
      ? "Introduce yourself as an AI. Chats may be stored."
      : "Introduce yourself as an AI and mention that the call is recorded.";

  return `${withExtras}${languageBlock}${outboundBlock}
## Important extras (fonio.info)
- ${recording}
- For company-specific information, use only the stored knowledge base. If the answer is not there, say a colleague will get back to them. Never guess.
- Always repeat prices, phone numbers, email addresses and opening hours exactly as they appear in the knowledge base.
- ${input.formality ? `Address the person with “${input.formality}”.` : input.german ? "Use Sie unless Du was specified." : "Keep a polite professional register."}
- Paste into: Assistants → Custom Prompt / Instructions → Custom Prompts. Keep the whole prompt short (fonio’s current prompt guide: under ~300 words).
`;
}

function startMessage(input: {
  name: string;
  company: string;
  german: boolean;
  template: AssistantTemplate;
}): { inbound: string; outbound: string } {
  const { name, company, german } = input;
  if (input.template.channel === "whatsapp") {
    return {
      inbound: german
        ? `{{#if firstname}}Hallo {{firstname}}{{else}}Hallo{{/if}}, hier ist ${name} von ${company}. Wie kann ich helfen?`
        : `{{#if firstname}}Hi {{firstname}}{{else}}Hi{{/if}}, this is ${name} from ${company}. How can I help?`,
      outbound: german
        ? `Hallo{{#if context.name}} {{context.name}}{{/if}}, hier ist ${name} von ${company}.`
        : `Hello{{#if context.name}} {{context.name}}{{/if}}, this is ${name} from ${company}.`,
    };
  }
  return {
    inbound: german
      ? `{{#if firstname}}Guten Tag {{firstname}}{{else}}Guten Tag{{/if}}, hier ist ${name} von ${company}. Wie kann ich Ihnen helfen?`
      : `{{#if firstname}}Hello {{firstname}}{{else}}Hello{{/if}}, this is ${name} from ${company}. How can I help you today?`,
    outbound: german
      ? `Guten Tag{{#if context.name}} {{context.name}}{{/if}}, hier ist ${name} von ${company}.{{#if context.reason}} Ich rufe an wegen {{context.reason}}.{{/if}}`
      : `Hello{{#if context.name}} {{context.name}}{{/if}}, this is ${name} from ${company}.{{#if context.reason}} I’m calling about {{context.reason}}.{{/if}}`,
  };
}

export function setupChecklist(input: {
  template: AssistantTemplate;
  name: string;
  languages: string;
  voice: string;
  event?: string;
  transfers?: string;
}): string[] {
  const whatsapp = input.template.channel === "whatsapp";
  const outbound = input.template.direction === "outbound";
  return [
    "Limitation: fonio’s public API cannot create or update assistants. Paste every section of this spec into the official app (app.fonio.ai). This unofficial community MCP only talks to documented public endpoints (API-key test, outbound calls, remote integration servers).",
    `Create: Assistants → ${whatsapp ? "Create New → WhatsApp Assistant" : "Create New"}. Name it “${input.name}”.`,
    `Start message: paste the inbound (and outbound if you use both) greeting. It is never auto-translated — write it in the language callers hear first.`,
    `Voice “${input.voice}” (confirm the live picker). Language: ${languageSetting(input.languages).appValue}. Waiting messages for integrations are also not auto-translated.`,
    "Prompt: Assistants → Custom Prompt / Instructions → Custom Prompts. Paste the full prompt. The entire text is used — no comments, no leftover [brackets].",
    "Knowledge → Information: paste each Q&A as its own entry (or Generate from the website). Enable Answer Questions on this assistant. Facts stay here, not in the prompt.",
    input.transfers
      ? `Transfers: describe If → Then rules matching “${input.transfers}”. Test Call cannot test forwarding — use a real phone. SIP needs the SIP toggle. International forwarding is under Technical.`
      : "Transfers: add If → Then rules for named people or topics. Test Call cannot test forwarding.",
    ...input.template.toolsToEnable.map((tool) => `Enable tool: ${tool}.`),
    input.event
      ? `Calendar: connect event “${input.event}” (fonio Scheduler, Cal.com, or Calendly) to this assistant. The prompt already names that event.`
      : "Calendar: if you book, create an event type and name it in the prompt.",
    "After-call: email (Fixed or Dynamic recipients; whitelist app@mail.fonio.com) and/or SMS confirmations if the add-on is on.",
    "During-call HTTP / inbound webhook: only if this use case looks up CRM or order data. Allowlist fonio webhook IPs. Waiting message ≤ 5 seconds.",
    "Technical: max call duration from typical calls + buffer; interrupt sensitivity; Accurate Information Processing for emails and IDs; disclose AI + recording; prefer automatic deletion if recording is refused.",
    outbound
      ? "Phone: outbound needs an imported or SIP fromNumber, Teams plan, and KYC. fromNumber selects the outbound assistant. Do not use a shared fonio number for outbound."
      : "Phone: buy a fonio number (inbound) and forward your existing line at the carrier. Outbound later needs import/SIP + Teams + KYC.",
    whatsapp
      ? "WhatsApp: finish Meta / fonio WhatsApp setup in the app, then paste the start message and prompt on the WhatsApp assistant."
      : "Optional webchat: window.fonio.webchat.* on your site after the assistant exists — see fonio.info/articles/webchat.",
    "Test with 3–5 real calls. Watch missing paths and handover rate, then shorten the prompt (~300 words per the current fonio.info guide).",
    "If this community snapshot disagrees with app.fonio.ai or fonio.info, trust the official app/docs.",
  ];
}

export function buildAssistant(input: BuildAssistantInput) {
  const company = input.company.trim();
  const useCase = input.useCase.trim();
  if (!company) throw new Error("company is required.");
  if (!useCase) throw new Error("useCase is required.");

  const template =
    getAssistantTemplate(input.template) ?? inferTemplate(useCase, input.channel);
  const channel = (input.channel as AssistantChannel) || template.channel;
  const german = looksGerman(
    `${input.languages ?? ""} ${useCase} ${company} ${input.formality ?? ""}`,
  );
  const name = (input.assistantName ?? "").trim() || defaultName(channel, german);
  const languages = input.languages?.trim() || (german ? "German" : "English");
  const voice = recommendVoice(template, languages);
  const resolvedTemplate = { ...template, channel };
  const prompt = buildAssistantPrompt({
    template: resolvedTemplate,
    name,
    german,
    company,
    useCase,
    languages,
    transferTargets: input.transferTargets,
    bookingEvent: input.bookingEvent,
    formality: input.formality,
    hours: input.hours,
    direction: input.direction,
  });
  const knowledge = draftKnowledgeBase({
    company,
    facts: input.companyFacts,
    hours: input.hours,
    language: languages,
  });
  const greetings = startMessage({
    name,
    company,
    german,
    template: resolvedTemplate,
  });
  const validation = validateAssistantPrompt(prompt);
  const outbound = template.direction === "outbound" || input.direction === "outbound";

  const appChecklist = setupChecklist({
    template: resolvedTemplate,
    name,
    languages,
    voice,
    event: input.bookingEvent,
    transfers: input.transferTargets,
  });

  return {
    status: "ready_to_paste" as const,
    limitation:
      "fonio’s public API cannot create or update assistants. Paste this entire spec into app.fonio.ai. After the assistant exists, this unofficial community MCP can test the workspace API key and, with confirmation, place an outbound call.",
    howToPresent:
      "Walk the user through every pastePack section in order. Do not claim the assistant was saved in the fonio workspace.",
    template: {
      slug: template.slug,
      title: template.title,
      officialTemplateUrl: OFFICIAL_TEMPLATE_URL[template.slug] ?? null,
    },
    assistant: {
      name,
      channel,
      direction: input.direction || template.direction,
      voice,
      language: languageSetting(languages).appValue,
      startMessage: outbound ? greetings.outbound : greetings.inbound,
      startMessageInbound: greetings.inbound,
      startMessageOutbound: greetings.outbound,
      waitingMessageNote:
        "Waiting messages for HTTP/integrations are not auto-translated. Write them in the callers’ language.",
      prompt,
    },
    knowledgeBase: {
      entries: knowledge,
      promptReminder:
        "For company-specific information, use only the stored knowledge base.",
    },
    transfers: input.transferTargets?.trim() || null,
    calendar: input.bookingEvent?.trim() || null,
    toolsToEnable: template.toolsToEnable,
    webhooks: {
      inbound:
        "Optional pre-call CRM lookup: POST {fromNumber, toNumber} → JSON fields become {{field}} in the start message and prompt. After the call they are also {{inboundContext.field}}.",
      duringCall:
        "Optional HTTP Request on the assistant (waiting message ≤ 5s). Describe spoken IDs in the prompt.",
      afterCall: "Email and/or SMS. Whitelist app@mail.fonio.com.",
    },
    technical: {
      maxCallDuration: "Set from typical calls plus a buffer.",
      interruptSensitivity:
        "Lower in noisy sites; raise for quiet or elderly callers.",
      accurateInformationProcessing:
        "Enable for emails, customer numbers, and spelled names.",
      recording:
        "Record audio ~30 days. Always disclose AI + recording. Prefer automatic deletion if refused.",
      internationalForwarding:
        "Technical → International call forwarding if you transfer abroad.",
    },
    phone: outbound
      ? "Imported or SIP fromNumber, Teams, KYC. fromNumber selects this outbound assistant."
      : "fonio number for inbound + carrier forwarding. Import/SIP later for outbound.",
    gdpr: "Introduce as an AI and mention recording on every voice call (EU AI Act / GDPR). Automatic deletion if refused.",
    variables: outbound
      ? ["{{context.name}}", "{{context.company}}", "{{context.reason}}"]
      : ["{{firstname}} from inbound webhook JSON", "{{personNumber}}", "{{conversationLink}}"],
    appChecklist,
    pastePack: {
      startMessageInbound: greetings.inbound,
      startMessageOutbound: greetings.outbound,
      prompt,
      knowledgeBase: knowledge,
      toolsToEnable: template.toolsToEnable,
      appChecklist,
    },
    validation,
  };
}
