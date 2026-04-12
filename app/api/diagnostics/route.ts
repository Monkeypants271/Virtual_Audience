import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import anthropic, { MODEL } from "@/lib/anthropic";
import { getDiagnosticsPrompt } from "@/lib/prompts";
import type { DiagnosticsRequest, DiagnosticsResponse, AssetImage } from "@/lib/types";

function buildContent(
  promptText: string,
  images?: AssetImage[]
): Anthropic.MessageParam["content"] {
  if (!images || images.length === 0) {
    return promptText;
  }

  const content: Anthropic.ContentBlockParam[] = [];

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
  const {
    assetText,
    brief,
    personaScores,
    aggregation,
    iterationNumber,
    images,
  }: DiagnosticsRequest = await req.json();

  const allReasons = personaScores.map((ps) => ps.reason);

  const promptText = getDiagnosticsPrompt(
    assetText,
    brief,
    aggregation.averageScore,
    aggregation.topObjections,
    aggregation.topPositives,
    allReasons,
    iterationNumber
  );

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: buildContent(promptText, images),
      },
    ],
  });

  const report = response.content[0].type === "text" ? response.content[0].text : "";
  const result: DiagnosticsResponse = { report };
  return NextResponse.json(result);
}
