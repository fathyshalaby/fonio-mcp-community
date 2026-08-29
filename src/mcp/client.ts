import { DEFAULT_API_BASE_URL } from "./version";

const E164_RE = /^\+[1-9]\d{1,14}$/;
const FONIO_NUMBER_RE = /^\+\d+$/;

export class FonioApiError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = "FonioApiError";
    this.status = status;
    this.body = body;
  }
}

export type OutboundCallInput = {
  fromNumber: string;
  toNumber: string;
  context?: Record<string, unknown>;
};

export type FonioStatusResponse = {
  status: "success" | "error";
  message: string;
};

export function normalizePhoneNumber(value: string): string {
  const trimmed = value.trim().replace(/[\s()-]/g, "");
  if (trimmed.startsWith("00")) {
    return `+${trimmed.slice(2)}`;
  }
  return trimmed;
}

export function assertE164(label: string, value: string): string {
  const normalized = normalizePhoneNumber(value);
  if (!FONIO_NUMBER_RE.test(normalized)) {
    throw new Error(
      `${label} must be in international format starting with +, e.g. +43123456789. Received: ${value}`,
    );
  }
  if (!E164_RE.test(normalized)) {
    throw new Error(
      `${label} looks invalid. Use E.164 (plus sign, country code, subscriber number, 8–15 digits). Received: ${value}`,
    );
  }
  return normalized;
}

export function assertConfirmedDestination(
  toNumber: string,
  confirmedToNumber: string,
): string {
  const normalizedToNumber = assertE164("toNumber", toNumber);
  const normalizedConfirmation = assertE164(
    "confirmedToNumber",
    confirmedToNumber,
  );
  if (normalizedConfirmation !== normalizedToNumber) {
    throw new Error(
      "Confirmation guard failed. Ask the user to confirm the exact destination number, then repeat that number in confirmedToNumber.",
    );
  }
  return normalizedToNumber;
}

export function getApiKey(): string | undefined {
  const fromEnv = process.env.FONIO_API_KEY?.trim();
  return fromEnv || undefined;
}

export function getBaseUrl(): string {
  return DEFAULT_API_BASE_URL;
}

export class FonioClient {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl = getBaseUrl(),
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async testApiKey(): Promise<FonioStatusResponse> {
    return this.post<FonioStatusResponse>("/public/v1/test-api-key", {});
  }

  async triggerOutboundCall(
    input: OutboundCallInput,
  ): Promise<FonioStatusResponse> {
    const fromNumber = assertE164("fromNumber", input.fromNumber);
    const toNumber = assertE164("toNumber", input.toNumber);
    return this.post<FonioStatusResponse>("/public/v1/outbound_call", {
      fromNumber,
      toNumber,
      ...(input.context && Object.keys(input.context).length > 0
        ? { context: input.context }
        : {}),
    });
  }

  private async post<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "fonio-mcp/1.0",
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new FonioApiError(
        `Could not reach the fonio API at ${url}: ${message}`,
        0,
        "",
      );
    }

    const text = await response.text();
    let parsed: unknown = text;
    if (text) {
      try {
        parsed = JSON.parse(text) as unknown;
      } catch {
        parsed = text;
      }
    }

    if (!response.ok) {
      const detail =
        typeof parsed === "object" && parsed !== null
          ? JSON.stringify(parsed)
          : text;
      throw new FonioApiError(
        `fonio API ${path} failed (${response.status}): ${detail || response.statusText}`,
        response.status,
        text,
      );
    }

    return parsed as T;
  }
}
