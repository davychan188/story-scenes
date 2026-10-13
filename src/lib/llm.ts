/**
 * xAI Grok (OpenAI-compatible Chat Completions).
 * Priority: XAI_API_KEY / GROK_API_KEY → demo mode.
 */

export type Provider = "grok" | "demo";

export function getGrokApiKey(): string | undefined {
  const key =
    process.env.XAI_API_KEY || process.env.GROK_API_KEY || undefined;
  return key && key.trim() ? key.trim() : undefined;
}

export function hasApiKey(): boolean {
  return Boolean(getGrokApiKey());
}

export function getProvider(): Provider {
  return hasApiKey() ? "grok" : "demo";
}

export const XAI_BASE_URL =
  process.env.XAI_BASE_URL || "https://api.x.ai/v1";

export const DEFAULT_MODEL =
  process.env.XAI_MODEL || process.env.GROK_MODEL || "grok-3-mini";

export const DEFAULT_IMAGE_MODEL =
  process.env.XAI_IMAGE_MODEL || "grok-imagine-image-2.0";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function chatCompletion(
  messages: ChatMessage[],
  options?: { temperature?: number; responseFormat?: "json_object" | "text" }
): Promise<string> {
  const apiKey = getGrokApiKey();
  if (!apiKey) {
    throw new Error("XAI_API_KEY / GROK_API_KEY not configured");
  }

  const body: Record<string, unknown> = {
    model: DEFAULT_MODEL,
    messages,
    temperature: options?.temperature ?? 0.4,
  };
  if (options?.responseFormat === "json_object") {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(`${XAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`xAI/Grok error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}
