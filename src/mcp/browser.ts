import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { BrowserContext, Locator, Page } from "playwright-core";
import { buildAssistant } from "./assistant";

const DEFAULT_APP_ORIGIN = "https://app.fonio.ai";
const DASHBOARD_PROFILE_DIR = join(homedir(), ".fonio-mcp", "chrome-profile");

export type BrowserConfig = {
  enabled: boolean;
  profileDir: string;
  appOrigin: string;
  executablePath?: string;
  cdpUrl?: string;
  headless: boolean;
};

export function browserConfigFromEnv(
  env: Partial<NodeJS.ProcessEnv> = process.env,
): BrowserConfig {
  const configuredOrigin = env.FONIO_APP_ORIGIN?.trim() || DEFAULT_APP_ORIGIN;
  let appOrigin = DEFAULT_APP_ORIGIN;
  try {
    const parsed = new URL(configuredOrigin);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      appOrigin = parsed.toString().replace(/\/$/, "");
    }
  } catch {
    // Keep the safe official origin when a local environment is malformed.
  }

  return {
    enabled: env.FONIO_ENABLE_BROWSER?.trim().toLowerCase() === "true",
    profileDir: env.FONIO_BROWSER_PROFILE_DIR?.trim() || DASHBOARD_PROFILE_DIR,
    appOrigin,
    executablePath:
      env.FONIO_BROWSER_EXECUTABLE_PATH?.trim() || findChromeExecutable(),
    cdpUrl: env.FONIO_BROWSER_CDP_URL?.trim() || undefined,
    headless: env.FONIO_BROWSER_HEADLESS?.trim().toLowerCase() === "true",
  };
}

function findChromeExecutable(): string | undefined {
  const candidates =
    process.platform === "darwin"
      ? [
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          "/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta",
          "/Applications/Chromium.app/Contents/MacOS/Chromium",
        ]
      : process.platform === "win32"
        ? [
            join(process.env.LOCALAPPDATA || "", "Google/Chrome/Application/chrome.exe"),
            join(process.env.PROGRAMFILES || "", "Google/Chrome/Application/chrome.exe"),
          ]
        : ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"];

  return candidates.find((candidate) => candidate && existsSync(candidate));
}

export function isFonioLoginUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return /(^|\/)login(?:\/|$)/i.test(parsed.pathname);
  } catch {
    return false;
  }
}

export type DashboardAssistantPlan = {
  operation: "create" | "update";
  name: string;
  channel: string;
  direction: string;
  voice: string;
  language: string;
  startMessage: string;
  prompt: string;
  knowledgeBase: Array<{ question: string; answer: string }>;
  toolsToEnable: string[];
  requiresHumanLogin: true;
  officialAppUrl: string;
};

export function toDashboardAssistantPlan(
  spec: ReturnType<typeof buildAssistant>,
  operation: "create" | "update" = "create",
): DashboardAssistantPlan {
  return {
    operation,
    name: spec.assistant.name,
    channel: spec.assistant.channel,
    direction: spec.assistant.direction,
    voice: spec.assistant.voice,
    language: spec.assistant.language,
    startMessage: spec.assistant.startMessage,
    prompt: spec.assistant.prompt,
    knowledgeBase: spec.knowledgeBase.entries,
    toolsToEnable: spec.toolsToEnable,
    requiresHumanLogin: true,
    officialAppUrl: DEFAULT_APP_ORIGIN,
  };
}

export type DashboardOperationResult = {
  status: "completed" | "requires_login" | "needs_manual_step" | "failed";
  operation: "create" | "update";
  assistantName: string;
  url: string;
  completed: string[];
  remaining: string[];
  message: string;
};

function browserDisabledMessage(): string {
  return "The local Fonio dashboard bridge is disabled. Set FONIO_ENABLE_BROWSER=true and run the MCP locally. It never runs in hosted mode.";
}

async function firstVisible(
  page: Page,
  candidates: Array<() => Locator>,
): Promise<Locator | undefined> {
  for (const candidate of candidates) {
    const locator = candidate().first();
    if ((await locator.count()) > 0 && (await locator.isVisible())) return locator;
  }
  return undefined;
}

async function clickFirst(
  page: Page,
  candidates: Array<() => Locator>,
): Promise<boolean> {
  const locator = await firstVisible(page, candidates);
  if (!locator) return false;
  await locator.click();
  return true;
}

async function fillFirst(
  page: Page,
  value: string,
  candidates: Array<() => Locator>,
): Promise<boolean> {
  const locator = await firstVisible(page, candidates);
  if (!locator) return false;
  await locator.fill(value);
  return true;
}

async function openAssistantArea(page: Page): Promise<boolean> {
  const opened = await clickFirst(page, [
    () => page.getByRole("link", { name: /^assistants$/i }),
    () => page.getByRole("button", { name: /^assistants$/i }),
    () => page.getByText(/^assistants$/i),
    () => page.locator('a[href*="assistant"]'),
  ]);
  if (!opened) return false;
  await page.waitForLoadState("domcontentloaded").catch(() => undefined);
  return true;
}

async function openCreateForm(page: Page): Promise<boolean> {
  return clickFirst(page, [
    () => page.getByRole("button", { name: /create new assistant/i }),
    () => page.getByRole("button", { name: /^create new$/i }),
    () => page.getByRole("link", { name: /create new assistant/i }),
    () => page.getByText(/create new assistant/i),
  ]);
}

async function fillAssistantBasics(
  page: Page,
  plan: DashboardAssistantPlan,
): Promise<string[]> {
  const completed: string[] = [];
  if (
    await fillFirst(page, plan.name, [
      () => page.getByLabel(/^name$/i),
      () => page.locator('input[name="name"]'),
      () => page.locator('input[placeholder*="name" i]'),
    ])
  ) {
    completed.push("assistant name");
  }

  if (
    await fillFirst(page, plan.startMessage, [
      () => page.getByLabel(/start message|welcome message|greeting/i),
      () => page.locator('textarea[name*="start" i]'),
      () => page.locator('textarea[placeholder*="welcome" i]'),
    ])
  ) {
    completed.push("start message");
  }

  if (
    await fillFirst(page, plan.prompt, [
      () => page.getByLabel(/custom prompt|instructions|prompt/i),
      () => page.locator('textarea[name*="prompt" i]'),
      () => page.locator('textarea[placeholder*="prompt" i]'),
    ])
  ) {
    completed.push("assistant prompt");
  }

  return completed;
}

async function saveAssistant(page: Page): Promise<boolean> {
  return clickFirst(page, [
    () => page.getByRole("button", { name: /save assistant/i }),
    () => page.getByRole("button", { name: /^save$/i }),
    () => page.getByRole("button", { name: /create assistant/i }),
    () => page.getByRole("button", { name: /^create$/i }),
  ]);
}

export class FonioBrowserSession {
  private context?: BrowserContext;
  private page?: Page;
  private readonly config: BrowserConfig;

  constructor(config = browserConfigFromEnv()) {
    this.config = config;
  }

  getConfig(): BrowserConfig {
    return this.config;
  }

  isRunning(): boolean {
    return Boolean(this.page && !this.page.isClosed());
  }

  async getPage(): Promise<Page> {
    if (!this.config.enabled) throw new Error(browserDisabledMessage());
    if (!this.page || this.page.isClosed()) {
      const { chromium } = await import("playwright-core");
      if (this.config.cdpUrl) {
        this.context = (await chromium.connectOverCDP(this.config.cdpUrl)).contexts()[0];
      } else {
        if (!this.config.executablePath) {
          throw new Error(
            "Chrome/Chromium was not found. Set FONIO_BROWSER_EXECUTABLE_PATH or FONIO_BROWSER_CDP_URL.",
          );
        }
        this.context = await chromium.launchPersistentContext(this.config.profileDir, {
          executablePath: this.config.executablePath,
          headless: this.config.headless,
          viewport: null,
        });
      }
      if (!this.context) throw new Error("Could not open a local browser context.");
      this.page = this.context.pages()[0] || (await this.context.newPage());
    }
    return this.page;
  }

  async openDashboard(): Promise<{ url: string; loggedIn: boolean }> {
    const page = await this.getPage();
    if (!page.url().startsWith(this.config.appOrigin)) {
      await page.goto(this.config.appOrigin, { waitUntil: "domcontentloaded" });
    }
    return { url: page.url(), loggedIn: !isFonioLoginUrl(page.url()) };
  }

  async createAssistant(
    plan: DashboardAssistantPlan,
  ): Promise<DashboardOperationResult> {
    const page = await this.getPage();
    await this.openDashboard();
    if (isFonioLoginUrl(page.url())) {
      return {
        status: "requires_login",
        operation: "create",
        assistantName: plan.name,
        url: page.url(),
        completed: [],
        remaining: ["Log in to app.fonio.ai in the opened local browser", "Create the assistant from the prepared plan"],
        message: "Log in manually in the opened browser, then call the create tool again. The MCP never receives or stores your password.",
      };
    }

    const completed: string[] = [];
    if (!(await openAssistantArea(page))) {
      return this.manualResult(plan.name, page.url(), "Could not locate the Assistants area. Open Assistants manually, then retry.");
    }
    if (!(await openCreateForm(page))) {
      return this.manualResult(plan.name, page.url(), "Could not locate Create New. Open the assistant creation form manually, then retry.");
    }
    completed.push(...(await fillAssistantBasics(page, plan)));
    if (!completed.includes("assistant name") || !completed.includes("assistant prompt")) {
      return {
        ...this.manualResult(plan.name, page.url(), "The Fonio form changed or a required field was not found. No save was attempted."),
        completed,
        remaining: ["Fill name, start message, prompt, voice, language, knowledge, and tools", "Save in Fonio"],
      };
    }
    if (!(await saveAssistant(page))) {
      return {
        ...this.manualResult(plan.name, page.url(), "The basics were filled, but the save button was not found. No save was attempted."),
        completed,
        remaining: ["Review the generated plan and save the assistant manually", "Add knowledge-base entries and enable the listed tools"],
      };
    }
    return {
      status: "completed",
      operation: "create",
      assistantName: plan.name,
      url: page.url(),
      completed: [...completed, "assistant saved"],
      remaining: ["Review voice/language, knowledge-base entries, transfers, calendar, webhooks, and GDPR settings", "Run real test calls"],
      message: "The assistant basics were saved through the local browser. Review the remaining Fonio settings before taking calls.",
    };
  }

  async updateAssistant(
    assistantName: string,
    plan: DashboardAssistantPlan,
  ): Promise<DashboardOperationResult> {
    const page = await this.getPage();
    await this.openDashboard();
    if (isFonioLoginUrl(page.url())) {
      return {
        status: "requires_login",
        operation: "update",
        assistantName,
        url: page.url(),
        completed: [],
        remaining: ["Log in to app.fonio.ai in the opened local browser", "Open and update the assistant"],
        message: "Log in manually in the opened browser, then call the update tool again.",
      };
    }
    if (!(await openAssistantArea(page))) {
      return this.manualResult(assistantName, page.url(), "Could not locate the Assistants area. Open it manually, then retry.", "update");
    }
    const target = await firstVisible(page, [
      () => page.getByText(assistantName, { exact: true }),
      () => page.getByRole("link", { name: assistantName, exact: true }),
      () => page.getByRole("button", { name: assistantName, exact: true }),
    ]);
    if (!target) {
      return this.manualResult(assistantName, page.url(), "Could not find an assistant with that exact name. No update was attempted.", "update");
    }
    await target.click();
    const completed = await fillAssistantBasics(page, { ...plan, operation: "update", name: assistantName });
    if (!completed.includes("assistant prompt")) {
      return {
        ...this.manualResult(assistantName, page.url(), "The update form changed or the prompt field was not found. No save was attempted.", "update"),
        completed,
      };
    }
    if (!(await saveAssistant(page))) {
      return {
        ...this.manualResult(assistantName, page.url(), "The prompt was filled, but the save button was not found. No save was attempted.", "update"),
        completed,
      };
    }
    return {
      status: "completed",
      operation: "update",
      assistantName,
      url: page.url(),
      completed: [...completed, "assistant saved"],
      remaining: ["Review settings and run real test calls"],
      message: "The assistant prompt and greeting were updated through the local browser.",
    };
  }

  async close(): Promise<void> {
    if (this.context && !this.config.cdpUrl) await this.context.close();
    this.context = undefined;
    this.page = undefined;
  }

  private manualResult(
    assistantName: string,
    url: string,
    message: string,
    operation: "create" | "update" = "create",
  ): DashboardOperationResult {
    return {
      status: "needs_manual_step",
      operation,
      assistantName,
      url,
      completed: [],
      remaining: ["Complete the requested action in the opened Fonio dashboard"],
      message,
    };
  }
}

export const fonioBrowserSession = new FonioBrowserSession();

export function describeBrowserConfig(config = browserConfigFromEnv()) {
  return {
    enabled: config.enabled,
    running: fonioBrowserSession.isRunning(),
    profileDir: config.profileDir,
    appOrigin: config.appOrigin,
    cdpConfigured: Boolean(config.cdpUrl),
    executableConfigured: Boolean(config.executablePath),
    headless: config.headless,
    security: "Local-only opt-in. The browser profile and Fonio login stay on the user’s machine.",
  };
}
