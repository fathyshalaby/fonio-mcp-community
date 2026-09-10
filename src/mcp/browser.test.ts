import { describe, expect, it } from "vitest";
import { buildAssistant } from "@/mcp/assistant";
import {
  browserConfigFromEnv,
  isFonioLoginUrl,
  toDashboardAssistantPlan,
} from "@/mcp/browser";
import {
  consumeDashboardConfirmation,
  issueDashboardConfirmation,
} from "@/oauth/tokens";

describe("local dashboard browser configuration", () => {
  it("is opt-in and defaults to a dedicated local profile", () => {
    const config = browserConfigFromEnv({});

    expect(config.enabled).toBe(false);
    expect(config.profileDir).toMatch(/\.fonio-mcp[\\/]chrome-profile$/);
    expect(config.appOrigin).toBe("https://app.fonio.ai");
  });

  it("does not treat the dashboard login page as authenticated", () => {
    expect(isFonioLoginUrl("https://app.fonio.ai/login")).toBe(true);
    expect(isFonioLoginUrl("https://app.fonio.ai/dashboard")).toBe(false);
  });
});

describe("dashboard assistant plan", () => {
  it("maps the generated paste pack into an explicit UI plan", () => {
    const spec = buildAssistant({
      company: "Acme",
      useCase: "receptionist that books demos",
      assistantName: "Mia",
      companyFacts: "Open weekdays 09:00–17:00",
    });

    const plan = toDashboardAssistantPlan(spec);

    expect(plan.operation).toBe("create");
    expect(plan.name).toBe("Mia");
    expect(plan.startMessage).toContain("Mia");
    expect(plan.prompt).toContain("## Role");
    expect(plan.knowledgeBase.length).toBeGreaterThan(0);
    expect(plan.toolsToEnable.length).toBeGreaterThan(0);
    expect(plan.requiresHumanLogin).toBe(true);
  });
});

describe("dashboard confirmation tokens", () => {
  it("is single-use and binds the operation to the assistant name", () => {
    const token = issueDashboardConfirmation({
      operation: "create",
      assistantName: "Mia",
    });

    expect(token).toMatch(/\./);
    expect(consumeDashboardConfirmation(token)).toEqual({
      operation: "create",
      assistantName: "Mia",
    });
    expect(() => consumeDashboardConfirmation(token)).toThrow(/already used/i);
  });
});
