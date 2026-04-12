import { NextRequest, NextResponse } from "next/server";
import anthropic, { MODEL } from "@/lib/anthropic";
import { getPersonaGeneratorPrompt } from "@/lib/prompts";
import type { GeneratePersonasRequest, GeneratePersonasResponse } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { icp, brief }: GeneratePersonasRequest = await req.json();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: getPersonaGeneratorPrompt(icp, brief),
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";

  // Strip any markdown code fences if present
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  const result: GeneratePersonasResponse = JSON.parse(cleaned);
  return NextResponse.json(result);
}
