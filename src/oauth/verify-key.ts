import { FonioClient } from "@/mcp/client";

export async function verifyFonioApiKey(apiKey: string): Promise<void> {
  const key = apiKey.trim();
  if (key.length < 8) {
    throw new Error("That does not look like a fonio API key.");
  }
  const result = await new FonioClient(key).testApiKey();
  if (result.status !== "success") {
    throw new Error(result.message || "fonio rejected this API key.");
  }
}
