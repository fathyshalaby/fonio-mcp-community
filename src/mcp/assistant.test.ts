import { describe, expect, it } from "vitest";
import {
  buildAssistant,
  draftKnowledgeBase,
  inferTemplate,
  listAssistantTemplates,
  validateAssistantPrompt,
} from "@/mcp/assistant";

describe("assistant templates", () => {
  it("lists the official-style starter kits", () => {
    const slugs = listAssistantTemplates().map((item) => item.slug);
    expect(slugs).toEqual([
      "receptionist",
      "answering_machine",
      "appointment_scheduling",
      "first_level_support",
      "outbound_callback",
      "whatsapp_booking",
    ]);
  });

  it("infers a template from the use case", () => {
    expect(inferTemplate("after-hours voicemail").slug).toBe("answering_machine");
    expect(inferTemplate("book hygiene appointments").slug).toBe(
      "appointment_scheduling",
    );
    expect(inferTemplate("WhatsApp chat for the salon").slug).toBe(
      "whatsapp_booking",
    );
    expect(inferTemplate("call the web-form lead back").slug).toBe(
      "outbound_callback",
    );
    expect(inferTemplate("first-level IT support desk").slug).toBe(
      "first_level_support",
    );
  });
});

describe("validateAssistantPrompt", () => {
  it("rejects a wall of text without GDPR and if-then rules", () => {
    const result = validateAssistantPrompt("Be nice and answer the phone.");
    expect(result.ok).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "too_short",
        "headings",
        "if_then",
        "ai_disclosure",
        "recording_disclosure",
        "escape_hatch",
      ]),
    );
  });
});

describe("buildAssistant", () => {
  it("returns a paste-ready receptionist spec that passes validation", () => {
    const spec = buildAssistant({
      company: "Praxis Sonnenberg",
      useCase: "Vienna dental reception, German first, book Prophylaxe, transfer billing",
      languages: "German and English, Multi",
      assistantName: "Marie",
      bookingEvent: "Prophylaxe",
      transferTargets: "Billing or invoices → Anna +43123456789",
      hours: "Mon–Thu 08:00–16:00, Fri 08:00–12:00",
      companyFacts: "Parking in front of the building.\nAddress: Sonnenbergstraße 12, 1010 Wien",
    });

    expect(spec.status).toBe("ready_to_paste");
    expect(spec.template.slug).toBe("receptionist");
    expect(spec.assistant.voice).toBe("Anna");
    expect(spec.assistant.language).toMatch(/Multi/);
    expect(spec.assistant.prompt).toContain("## Role");
    expect(spec.assistant.prompt).toContain("You are Marie");
    expect(spec.assistant.prompt).toContain("Prophylaxe");
    expect(spec.assistant.prompt).toMatch(/recorded/i);
    expect(spec.assistant.prompt).toMatch(/^## Role/m);
    expect(spec.validation.ok).toBe(true);
    expect(spec.knowledgeBase.entries.some((entry) => /park/i.test(entry.question))).toBe(
      true,
    );
    expect(spec.appChecklist[0]).toMatch(/Assistants/);
  });

  it("builds an outbound callback prompt with context variables", () => {
    const spec = buildAssistant({
      company: "Acme",
      useCase: "outbound callback for a web-form lead about a Q3 quote",
      assistantName: "Leo",
    });
    expect(spec.template.slug).toBe("outbound_callback");
    expect(spec.assistant.prompt).toMatch(/\{\{context\.name\}\}|\{\{first_name\}\}/);
    expect(spec.assistant.startMessageOutbound).toContain("{{context.reason}}");
  });

  it("requires company and use case", () => {
    expect(() => buildAssistant({ company: "", useCase: "x" })).toThrow(/company/);
    expect(() => buildAssistant({ company: "Acme", useCase: "  " })).toThrow(/useCase/);
  });
});

describe("draftKnowledgeBase", () => {
  it("parses Q&A and hours", () => {
    const entries = draftKnowledgeBase({
      company: "Acme",
      hours: "9–17",
      facts: "Do you have parking? Yes, in the courtyard.\nAddress: 1 Main Street",
    });
    expect(entries[0]).toEqual({
      question: "What are your opening hours?",
      answer: "9–17",
    });
    expect(entries.some((entry) => entry.question.includes("parking"))).toBe(true);
  });
});
