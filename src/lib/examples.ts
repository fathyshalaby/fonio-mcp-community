export type ExampleTurn = {
  role: "user" | "assistant" | "tool";
  name?: string;
  text: string;
};

export type Example = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  prompt: string;
  tools: string[];
  thread: ExampleTurn[];
};

export const EXAMPLES: Example[] = [
  {
    slug: "build-agent",
    title: "Build a fonio agent from a sentence",
    eyebrow: "Agent builder",
    summary:
      "Claude picks a template, generates a paste-ready prompt and knowledge Q&A, validates GDPR rules, and hands you an app.fonio.ai checklist — the ElevenLabs-style flow, scoped to fonio.",
    prompt:
      "Build a fonio voice agent for Praxis Sonnenberg in Vienna. German first, switch to English if asked. Book hygiene in the Scheduler event “Prophylaxe”. Transfer billing to Anna on +43123456789. Hours Mon–Thu 08–16, Fri 08–12. Parking in front of the building.",
    tools: [
      "list_assistant_templates",
      "build_assistant",
      "validate_assistant_prompt",
      "draft_knowledge_base",
    ],
    thread: [
      {
        role: "user",
        text: "Build a fonio voice agent for Praxis Sonnenberg in Vienna. German first, Multi if needed. Book Prophylaxe. Transfer billing to Anna. Hours Mon–Thu 08–16.",
      },
      {
        role: "tool",
        name: "list_assistant_templates",
        text: "receptionist — greet, knowledge Q&A, named Scheduler event, named transfers.",
      },
      {
        role: "tool",
        name: "build_assistant",
        text: "ready_to_paste · Marie · voice Anna · language Multi · start message with {{firstname}} fallback · prompt with If-Then booking/transfer · Q&A for hours and parking · checklist for app.fonio.ai.",
      },
      {
        role: "tool",
        name: "validate_assistant_prompt",
        text: "{\"ok\":true,\"issues\":[]}",
      },
      {
        role: "assistant",
        text: "Paste this in Assistants → Create New. Start message and prompt are ready. Add the Q&A under Knowledge → Information, connect event “Prophylaxe”, and set Call transfer → Anna. The public API cannot save the assistant for you — that step is in the app. I can place a test outbound call later if you confirm the number.",
      },
    ],
  },
  {
    slug: "receptionist-prompt",
    title: "Write a receptionist that books and transfers",
    eyebrow: "Prompting",
    summary:
      "Claude reads fonio prompting rules, then pastes a production prompt for a Vienna dental clinic — Scheduler booking plus a billing transfer.",
    prompt:
      "Write a fonio receptionist prompt for Praxis Sonnenberg in Vienna. German first, switch to English if asked. Book hygiene in the Scheduler event “Prophylaxe”. Transfer billing questions to Anna on +43123456789. Introduce as AI and mention recording.",
    tools: ["search_docs", "get_doc", "write_assistant_prompt"],
    thread: [
      {
        role: "user",
        text: "Write a fonio receptionist prompt for Praxis Sonnenberg in Vienna. German first, switch to English if asked. Book hygiene in the Scheduler event “Prophylaxe”. Transfer billing questions to Anna on +43 1 234 56789. Introduce as AI and mention recording.",
      },
      {
        role: "tool",
        name: "search_docs",
        text: "Matched prompting, calendar, first-steps — if-then rules, Multi language, “book in event Prophylaxe”.",
      },
      {
        role: "assistant",
        text: "Here is a paste-ready prompt: sections for conversation flow, if-then booking and transfer, GDPR disclosure, and “use only the knowledge base for hours and prices.” Enable Call transfer → Anna, connect the Prophylaxe event, set voice + language to Multi.",
      },
    ],
  },
  {
    slug: "inbound-webhook",
    title: "Greet known callers by name",
    eyebrow: "Webhooks",
    summary:
      "Design the pre-call lookup: fonio posts fromNumber, your CRM returns JSON, the greeting uses {{name}} with a fallback.",
    prompt:
      "Design a fonio inbound webhook that looks up callers in HubSpot by phone. If we know them, start with “Hello {{firstname}}”. If not, use a generic greeting. Show the JSON contract and a Make/n8n sketch.",
    tools: ["search_docs", "get_doc", "setup_inbound_webhook"],
    thread: [
      {
        role: "user",
        text: "Design an inbound webhook that looks up callers in HubSpot. Greet them by first name when we know them.",
      },
      {
        role: "tool",
        name: "get_doc",
        text: "api-webhooks — payload {fromNumber, toNumber}, JSON response, {{name}} vs {{inboundContext.customerId}}, allowlisted IPs.",
      },
      {
        role: "assistant",
        text: "Enable Inbound Webhook, point it at Make/n8n, search HubSpot by fromNumber, return {\"firstname\":\"Ada\"}. Start message: {{#if firstname}}Hello {{firstname}}{{else}}Hello, thanks for calling Praxis Sonnenberg{{/if}}. IDs stay in {{inboundContext.*}} so the model cannot rewrite them.",
      },
    ],
  },
  {
    slug: "form-to-call",
    title: "Call a web-form lead back in 30 seconds",
    eyebrow: "Outbound API",
    summary:
      "Wire a contact form to POST /public/v1/outbound_call. fromNumber selects the outbound assistant; context personalizes the first sentence.",
    prompt:
      "A lead just submitted our “Request a callback” form: Ada Lovelace, +4915123456789, company Acme, reason “Q3 quote”. Explain fromNumber vs toNumber, give me curl, and list what must be true before we dial (Teams, KYC, imported number).",
    tools: ["get_api_reference", "get_doc", "setup_outbound_call"],
    thread: [
      {
        role: "user",
        text: "Lead on the website: Ada, +49 151 23456789, wants a callback about the Q3 quote. How do I have fonio call her?",
      },
      {
        role: "tool",
        name: "get_doc",
        text: "outbound-api — POST /public/v1/outbound_call, fromNumber = your imported line, toNumber = Ada, context.name / context.reason.",
      },
      {
        role: "assistant",
        text: "Checklist: Teams plan, KYC done, imported/SIP fromNumber assigned to your outbound assistant. Then:\n\ncurl -X POST https://app.fonio.ai/api/public/v1/outbound_call \\\n  -H \"Authorization: Bearer $FONIO_API_KEY\" \\\n  -d '{\"fromNumber\":\"+43123456789\",\"toNumber\":\"+4915123456789\",\"context\":{\"name\":\"Ada\",\"reason\":\"Q3 quote\"}}'\n\nIn the prompt: “You are calling {{context.name}} about {{context.reason}}.” I will not place the call until you confirm the number.",
      },
    ],
  },
  {
    slug: "place-the-call",
    title: "Place the call — only after you confirm",
    eyebrow: "Live call",
    summary:
      "The cost tool. Claude verifies the key, restates the destination, and only then calls trigger_outbound_call.",
    prompt:
      "My imported number is +43123456789. Call +4915123456789. Context: name=Ada, reason=Q3 quote. Confirm the destination back to me before you dial.",
    tools: ["test_api_key", "prepare_outbound_call", "trigger_outbound_call"],
    thread: [
      {
        role: "user",
        text: "FONIO_API_KEY is set. Call Ada on +49 151 23456789 from +43 123 456789 about the Q3 quote. Confirm first.",
      },
      {
        role: "tool",
        name: "test_api_key",
        text: "{\"status\":\"success\",\"message\":\"API key is valid.\"}",
      },
      {
        role: "assistant",
        text: "I will call +4915123456789 (Ada) from +43123456789 with context reason=Q3 quote. This is a real, billed outbound call. Say “yes, dial” to proceed.",
      },
      {
        role: "user",
        text: "Yes, dial.",
      },
      {
        role: "tool",
        name: "trigger_outbound_call",
        text: "{\"status\":\"success\",\"message\":\"Outbound call triggered.\"}",
      },
      {
        role: "assistant",
        text: "Call is ringing. Watch the inbox on app.fonio.ai for the live transcript.",
      },
    ],
  },
];

export function linkedInPostEn(mcpUrl: string) {
  return `Unofficial open-source MCP for fonio.ai — not a SaaS, not affiliated with fonio GmbH.

MIT, no warranty. I have no association with fonio. No liability for use, including billed outbound calls or a volunteer-hosted URL. Self-host the repo, or add a /mcp URL at your own risk.

Same idea as the ElevenLabs MCP, but unofficial: paste a workspace API key (not a fonio password), then build voice and WhatsApp agents in chat:

${mcpUrl}

Then you can say:

“Build a receptionist that books Prophylaxe in the Scheduler and transfers billing to Anna.”
“Look this caller up in HubSpot before the greeting.”
“A lead just submitted the form — call Ada back from our imported number about the Q3 quote.”

Repo: https://github.com/fathyshalaby/fonio-mcp-community

#MCP #VoiceAI #Claude #OpenAI #OpenSource`;
}

export function linkedInPostDe(mcpUrl: string) {
  return `Inoffizieller Open-Source-MCP für fonio.ai — kein SaaS, keine Verbindung zu fonio GmbH.

MIT, ohne Gewähr. Ich habe keine Verbindung zu fonio. Keine Haftung, auch nicht für kostenpflichtige Outbound-Anrufe oder eine ehrenamtlich gehostete URL. Repo selbst hosten oder /mcp auf eigenes Risiko nutzen.

Wie der ElevenLabs-MCP, aber inoffiziell: Workspace-API-Key einfügen (kein fonio-Passwort), dann Sprach- und WhatsApp-Agenten im Chat bauen:

${mcpUrl}

Dann z.B.:

„Bau einen Empfangs-Agenten, der Prophylaxe im Scheduler bucht und Billing an Anna weiterleitet.“
„Schau den Anrufer vor der Begrüßung in HubSpot nach.“
„Ein Lead hat das Formular abgeschickt — ruf Ada von unserer importierten Nummer wegen des Q3-Angebots zurück.“

Repo: https://github.com/fathyshalaby/fonio-mcp-community

#MCP #VoiceAI #Claude #OpenAI #OpenSource`;
}

export const LINKEDIN_POST_EN = linkedInPostEn("https://<your-host>/mcp");
export const LINKEDIN_POST_DE = linkedInPostDe("https://<your-host>/mcp");
