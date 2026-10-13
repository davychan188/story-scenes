export type GrammarLevel = "good" | "minor" | "important";

export type GrammarTip = {
  original: string;
  suggestion: string;
  reasonZh: string;
  level: GrammarLevel;
};

/** Heuristic mock tips for demo mode (no API key). */
export function getMockGrammarTips(text: string): GrammarTip[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const tips: GrammarTip[] = [];

  if (
    /\b(yesterday|last\s+(week|night|month|year)|ago)\b/i.test(trimmed) &&
    /\b(i|he|she|we|they)\s+go\b/i.test(trimmed)
  ) {
    tips.push({
      original: trimmed.match(/\b(i|he|she|we|they)\s+go\b/i)?.[0] ?? "go",
      suggestion:
        trimmed.match(/\b(i|he|she|we|they)\s+go\b/i)?.[0]?.replace(/go/i, (m) =>
          m[0] === "G" ? "Went" : "went"
        ) ?? "went",
      reasonZh: "有 yesterday／last… 等過去時間時，動詞要用過去式（went）。",
      level: "important",
    });
  }

  if (/\bi\s+want\b/i.test(trimmed) && !/\bi('d| would)\s+like\b/i.test(trimmed)) {
    tips.push({
      original: trimmed.match(/\bi\s+want\b/i)?.[0] ?? "I want",
      suggestion: "I'd like",
      reasonZh: "正式／英式寫作中，「I'd like…」比「I want…」更自然有禮。",
      level: "minor",
    });
  }

  if (/\bvery\s+like\b/i.test(trimmed)) {
    tips.push({
      original: trimmed.match(/\bvery\s+like\b/i)?.[0] ?? "very like",
      suggestion: "really like / like … a lot",
      reasonZh: "「very」一般不直接修飾動詞 like；可說 really like 或 like it a lot。",
      level: "minor",
    });
  }

  if (/\bi\s+am\s+agree\b/i.test(trimmed) || /\bi'?m\s+agree\b/i.test(trimmed)) {
    tips.push({
      original: trimmed.match(/\bi(?:\s+am|'m)\s+agree\b/i)?.[0] ?? "I am agree",
      suggestion: "I agree",
      reasonZh: "agree 是動詞，直接說 I agree，不用 am。",
      level: "important",
    });
  }

  if (/\bdiscuss\s+about\b/i.test(trimmed)) {
    tips.push({
      original: trimmed.match(/\bdiscuss\s+about\b/i)?.[0] ?? "discuss about",
      suggestion: "discuss",
      reasonZh: "discuss 後面直接加主題，不需要 about。",
      level: "minor",
    });
  }

  if (/\bcolor\b/i.test(trimmed)) {
    tips.push({
      original: "color",
      suggestion: "colour",
      reasonZh: "英式拼法用 colour（不是 color）。",
      level: "minor",
    });
  }
  if (/\bfavor\b/i.test(trimmed) && !/\bfavour\b/i.test(trimmed)) {
    tips.push({
      original: "favor",
      suggestion: "favour",
      reasonZh: "英式拼法為 favour。",
      level: "minor",
    });
  }
  if (/\bcenter\b/i.test(trimmed) && !/\bcentre\b/i.test(trimmed)) {
    tips.push({
      original: "center",
      suggestion: "centre",
      reasonZh: "英式拼法為 centre（不是 center）。",
      level: "minor",
    });
  }
  if (/\borganize\b/i.test(trimmed)) {
    tips.push({
      original: "organize",
      suggestion: "organise",
      reasonZh: "英式拼法通常寫 organise。",
      level: "minor",
    });
  }

  // Simple article hint
  if (/\bthere\s+is\s+[a-z]+s\b/i.test(trimmed)) {
    const m = trimmed.match(/\bthere\s+is\s+([a-z]+s)\b/i);
    if (m) {
      tips.push({
        original: `there is ${m[1]}`,
        suggestion: `there are ${m[1]}`,
        reasonZh: "複數名詞要用 there are，不是 there is。",
        level: "important",
      });
    }
  }

  if (tips.length === 0) {
    return [
      {
        original: trimmed.slice(0, 80),
        suggestion: trimmed.slice(0, 80),
        reasonZh: "整體清楚！可以再加一點細節（誰、在哪、發生什麼）令故事更立體。",
        level: "good",
      },
    ];
  }

  return tips.slice(0, 5);
}

/** Light heuristic correction for demo mode. */
export function getMockCorrectedText(text: string): string {
  let out = text.trim();
  out = out.replace(/\bcolor\b/gi, (m) => (m[0] === "C" ? "Colour" : "colour"));
  out = out.replace(/\bfavor\b/gi, (m) => (m[0] === "F" ? "Favour" : "favour"));
  out = out.replace(/\bcenter\b/gi, (m) => (m[0] === "C" ? "Centre" : "centre"));
  out = out.replace(/\borganize\b/gi, (m) =>
    m[0] === "O" ? "Organise" : "organise"
  );
  out = out.replace(/\bdiscuss\s+about\b/gi, "discuss");
  out = out.replace(/\bi\s+am\s+agree\b/gi, "I agree");
  out = out.replace(/\bi'?m\s+agree\b/gi, "I agree");
  out = out.replace(/\bvery\s+like\b/gi, "really like");
  out = out.replace(/\bthere\s+is\s+([a-z]+s)\b/gi, "there are $1");
  // Capitalise first letter
  if (out.length > 0) {
    out = out.charAt(0).toUpperCase() + out.slice(1);
  }
  return out;
}
