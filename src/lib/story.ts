import { chatCompletion } from "./llm";
import type { GrammarTip } from "./grammar";
import type { Scene } from "./types";
import { generateSceneImages } from "./images";
import { buildDemoStoryResult } from "./mock";
import { getProvider, hasApiKey } from "./llm";

type PlannedPayload = {
  correctedText: string;
  tips: GrammarTip[];
  scenes: Array<{
    index: number;
    title: string;
    caption: string;
    imagePrompt: string;
  }>;
};

const PLAN_SYSTEM = `You are an English writing coach and storyboard director for Hong Kong learners.
The user writes an English story or description (may contain errors).

Return ONLY valid JSON with this exact shape:
{
  "correctedText": "full corrected story in clear natural English (British spelling preferred)",
  "tips": [
    {
      "original": "exact phrase from the user's text",
      "suggestion": "better phrase",
      "reasonZh": "brief Traditional Chinese explanation",
      "level": "good" | "minor" | "important"
    }
  ],
  "scenes": [
    {
      "index": 1,
      "title": "short English scene title",
      "caption": "1-2 English sentences describing this beat",
      "imagePrompt": "detailed English image prompt for a cinematic 16:9 storyboard panel"
    }
  ]
}

Rules:
- Exactly 4 scenes, indices 1-4, sequential story beats (opening → rising → climax/turning → ending).
- Keep the same characters, setting, and visual style across all 4 imagePrompt fields. Start each imagePrompt with a shared style lock phrase like: "Same characters and cinematic storyboard style throughout:" then the scene specifics.
- tips: 1-5 items. If the writing is already good, one tip with level "good" and praise in reasonZh is fine.
- Prefer clear natural English; British spelling (colour, centre, organise) is OK.
- Do not invent unrelated plots; stay faithful to the user's story, only polish and structure into 4 beats.
- Captions and titles must be in English. reasonZh must be Traditional Chinese.`;

function extractJson(raw: string): string {
  const trimmed = raw.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) return fence[1].trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

function normalisePlan(parsed: PlannedPayload, fallbackText: string): PlannedPayload {
  const correctedText =
    (parsed.correctedText || fallbackText || "").trim() || fallbackText.trim();

  const tips: GrammarTip[] = Array.isArray(parsed.tips)
    ? parsed.tips
        .filter((t) => t && typeof t.reasonZh === "string")
        .slice(0, 5)
        .map((t) => ({
          original: String(t.original ?? ""),
          suggestion: String(t.suggestion ?? ""),
          reasonZh: String(t.reasonZh ?? ""),
          level:
            t.level === "good" || t.level === "important" || t.level === "minor"
              ? t.level
              : "minor",
        }))
    : [];

  let scenes = Array.isArray(parsed.scenes) ? parsed.scenes : [];
  scenes = scenes
    .map((s, i) => ({
      index: Number(s.index) || i + 1,
      title: String(s.title || `Scene ${i + 1}`).trim(),
      caption: String(s.caption || "").trim(),
      imagePrompt: String(s.imagePrompt || s.caption || "").trim(),
    }))
    .slice(0, 4);

  while (scenes.length < 4) {
    const i = scenes.length + 1;
    scenes.push({
      index: i,
      title: `Scene ${i}`,
      caption: correctedText.slice(0, 120) || `Part ${i} of the story.`,
      imagePrompt: `Same characters and cinematic storyboard style throughout: scene ${i} of 4, 16:9 widescreen. ${correctedText.slice(0, 200)}`,
    });
  }

  scenes = scenes.map((s, i) => ({ ...s, index: i + 1 }));

  return { correctedText, tips, scenes };
}

async function planWithGrok(text: string): Promise<PlannedPayload> {
  const raw = await chatCompletion(
    [
      { role: "system", content: PLAN_SYSTEM },
      {
        role: "user",
        content: `Please correct and storyboard this English story into exactly 4 scenes:\n\n${text}`,
      },
    ],
    { temperature: 0.35, responseFormat: "json_object" }
  );

  let parsed: PlannedPayload;
  try {
    parsed = JSON.parse(extractJson(raw)) as PlannedPayload;
  } catch {
    throw new Error("Failed to parse storyboard JSON from Grok");
  }
  return normalisePlan(parsed, text);
}

export async function processStory(text: string): Promise<{
  provider: "grok" | "demo";
  demoMode: boolean;
  correctedText: string;
  tips: GrammarTip[];
  scenes: Scene[];
}> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("Please write a short English story first.");
  }
  if (trimmed.length > 4000) {
    throw new Error("Story is too long (max about 4000 characters).");
  }

  if (!hasApiKey()) {
    const demo = buildDemoStoryResult(trimmed);
    return {
      provider: "demo",
      demoMode: true,
      ...demo,
    };
  }

  const plan = await planWithGrok(trimmed);
  const imageUrls = await generateSceneImages(
    plan.scenes.map((s) => s.imagePrompt)
  );

  const scenes: Scene[] = plan.scenes.map((s, i) => ({
    ...s,
    imageUrl: imageUrls[i] ?? null,
  }));

  return {
    provider: getProvider(),
    demoMode: false,
    correctedText: plan.correctedText,
    tips: plan.tips,
    scenes,
  };
}
