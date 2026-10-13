import { NextResponse } from "next/server";
import {
  DEFAULT_IMAGE_MODEL,
  DEFAULT_MODEL,
  getProvider,
  hasApiKey,
} from "@/lib/llm";
import type { StatusResponse } from "@/lib/types";

export async function GET() {
  const provider = getProvider();
  const demoMode = !hasApiKey();
  const body: StatusResponse = {
    provider,
    demoMode,
    textModel: demoMode ? null : DEFAULT_MODEL,
    imageModel: demoMode ? null : DEFAULT_IMAGE_MODEL,
  };
  return NextResponse.json(body);
}
