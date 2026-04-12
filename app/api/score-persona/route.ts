import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import anthropic, { MODEL } from "@/lib/anthropic";
import { getPersonaScorerPrompt } from "@/lib/prompts";
import type { ScorePersonaRequest, ScorePersonaResponse, AssetImage } from "@/lib/types";

function buildContent(
  promptText: string,
  images?: AssetImage[]
): Anthropic.MessageParam["content"] {
  if (!images || images.length === 0) {
    return promptText;
  }

  const content: Anthropic.ContentBlockParam[] = [];

  // Images first so Claude sees visuals before reading the prompt
  for (const img of images) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: img.mediaType,
        data: img.base64,
      },
    });
  }

  content.push({ type: "text", text: promptText });
  return content;
}

export async function POST(req: NextRequest) {
  const { persona, brief, assetText, images }: ScorePersonaRequest = await req.json();

  const promptText = getPersonaScorerPrompt(
    JSON.stringify(persona, null, 2),
    brief,
    assetText
  );

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: buildContent(promptText, images),
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";

  // Extract JSON object from response — handles prose before/after the JSON block
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const cleaned = jsonMatch
    ? jsonMatch[0]
    : text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    const result: ScorePersonaResponse = JSON.parse(cleaned);
    return NextResponse.json(result);
  } catch {
    // Fallback: return a neutral score so one bad parse doesn't crash the whole run
    return NextResponse.json({ score: 5, reason: "Scoring unavailable for this persona." });
  }
}
