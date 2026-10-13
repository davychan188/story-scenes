import {
  getMockCorrectedText,
  getMockGrammarTips,
  type GrammarTip,
} from "./grammar";
import type { Scene } from "./types";

const PANEL_COLORS = [
  { bg: "#0f766e", accent: "#5eead4", label: "#ecfdf5" },
  { bg: "#1d4ed8", accent: "#93c5fd", label: "#eff6ff" },
  { bg: "#7c3aed", accent: "#c4b5fd", label: "#f5f3ff" },
  { bg: "#b45309", accent: "#fcd34d", label: "#fffbeb" },
];

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapLines(text: string, maxLen: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxLen && cur) {
      lines.push(cur);
      cur = w;
      if (lines.length >= maxLines) break;
    } else {
      cur = next;
    }
  }
  if (lines.length < maxLines && cur) lines.push(cur);
  return lines.slice(0, maxLines);
}

export function makePlaceholderSvg(
  index: number,
  title: string,
  caption: string
): string {
  const c = PANEL_COLORS[(index - 1) % PANEL_COLORS.length];
  const titleLines = wrapLines(title || `Scene ${index}`, 28, 2);
  const capLines = wrapLines(caption || "", 36, 3);

  const titleTspans = titleLines
    .map(
      (line, i) =>
        `<tspan x="40" dy="${i === 0 ? 0 : 36}">${escapeXml(line)}</tspan>`
    )
    .join("");
  const capTspans = capLines
    .map(
      (line, i) =>
        `<tspan x="40" dy="${i === 0 ? 0 : 26}">${escapeXml(line)}</tspan>`
    )
    .join("");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c.bg}"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#g)"/>
  <rect x="32" y="32" width="1216" height="656" rx="24" fill="none" stroke="${c.accent}" stroke-width="3" opacity="0.55"/>
  <text x="40" y="72" fill="${c.accent}" font-family="system-ui,sans-serif" font-size="22" font-weight="700" letter-spacing="2">SCENE ${index} · DEMO</text>
  <text x="40" y="160" fill="${c.label}" font-family="system-ui,sans-serif" font-size="42" font-weight="700">${titleTspans}</text>
  <text x="40" y="520" fill="${c.label}" font-family="system-ui,sans-serif" font-size="24" opacity="0.9">${capTspans}</text>
  <text x="40" y="660" fill="${c.accent}" font-family="system-ui,sans-serif" font-size="18" opacity="0.7">Story Scenes · placeholder panel</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function splitIntoFourBeats(text: string): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length >= 4) {
    // Distribute sentences across 4 beats
    const beats: string[] = ["", "", "", ""];
    sentences.forEach((s, i) => {
      const idx = Math.min(3, Math.floor((i * 4) / sentences.length));
      beats[idx] = beats[idx] ? `${beats[idx]} ${s}` : s;
    });
    return beats.map((b, i) => b || `Part ${i + 1} of the story.`);
  }

  if (sentences.length === 3) {
    return [sentences[0], sentences[1], sentences[2], "The story comes to a close."];
  }
  if (sentences.length === 2) {
    return [
      sentences[0],
      `Meanwhile, things begin to change.`,
      sentences[1],
      "Finally, everything settles.",
    ];
  }
  if (sentences.length === 1) {
    const s = sentences[0];
    return [
      `We meet the world of the story: ${s}`,
      "Something unexpected happens next.",
      "The characters face a challenge.",
      "The story reaches its ending.",
    ];
  }

  return [
    "A quiet beginning.",
    "The adventure starts.",
    "A turning point arrives.",
    "A memorable ending.",
  ];
}

const DEFAULT_TITLES = [
  "Opening",
  "Rising action",
  "Climax",
  "Ending",
];

export function buildDemoScenes(correctedText: string): Scene[] {
  const beats = splitIntoFourBeats(correctedText);
  return beats.map((caption, i) => {
    const index = i + 1;
    const title = DEFAULT_TITLES[i];
    const imagePrompt = `Cinematic storyboard panel ${index}/4, 16:9, consistent characters and art style across the story: ${caption}`;
    return {
      index,
      title,
      caption,
      imagePrompt,
      imageUrl: makePlaceholderSvg(index, title, caption),
    };
  });
}

export function buildDemoStoryResult(text: string): {
  correctedText: string;
  tips: GrammarTip[];
  scenes: Scene[];
} {
  const tips = getMockGrammarTips(text);
  const correctedText = getMockCorrectedText(text);
  const scenes = buildDemoScenes(correctedText);
  return { correctedText, tips, scenes };
}
