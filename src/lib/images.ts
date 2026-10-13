import {
  DEFAULT_IMAGE_MODEL,
  XAI_BASE_URL,
  getGrokApiKey,
} from "./llm";

export type GeneratedImage = {
  url?: string;
  b64?: string;
};

/**
 * Generate one image from a prompt via xAI Imagine.
 * Uses aspect_ratio 16:9 for cinematic storyboard panels.
 */
export async function generateImage(
  prompt: string,
  options?: { responseFormat?: "url" | "b64_json" }
): Promise<GeneratedImage> {
  const apiKey = getGrokApiKey();
  if (!apiKey) {
    throw new Error("XAI_API_KEY / GROK_API_KEY not configured");
  }

  const responseFormat = options?.responseFormat ?? "url";

  const res = await fetch(`${XAI_BASE_URL}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEFAULT_IMAGE_MODEL,
      prompt,
      n: 1,
      aspect_ratio: "16:9",
      response_format: responseFormat,
      quality: "low",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`xAI Imagine error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const item = data.data?.[0];
  if (!item) {
    throw new Error("xAI Imagine returned no image data");
  }

  if (item.b64_json) {
    return { b64: item.b64_json, url: `data:image/jpeg;base64,${item.b64_json}` };
  }
  return { url: item.url as string };
}

/** Generate 4 scene images in parallel (distinct prompts). */
export async function generateSceneImages(
  prompts: string[]
): Promise<(string | null)[]> {
  const results = await Promise.allSettled(
    prompts.map((p) => generateImage(p, { responseFormat: "url" }))
  );

  return results.map((r) => {
    if (r.status === "fulfilled") {
      return r.value.url ?? null;
    }
    console.error("Image generation failed:", r.reason);
    return null;
  });
}
