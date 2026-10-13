import { NextResponse } from "next/server";
import { processStory } from "@/lib/story";

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const text = typeof body?.text === "string" ? body.text : "";

    if (!text.trim()) {
      return NextResponse.json(
        { error: "請先用英文寫一段故事。" },
        { status: 400 }
      );
    }

    const result = await processStory(text);
    return NextResponse.json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Something went wrong.";
    console.error("[/api/story]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
