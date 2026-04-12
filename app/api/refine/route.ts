import { NextRequest, NextResponse } from "next/server";
import anthropic, { MODEL } from "@/lib/anthropic";
import { getRefinementPrompt } from "@/lib/prompts";
import type { RefineRequest, RefineResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { assetText, brief, diagnosticReport, previousScore }: RefineRequest = await req.json();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: getRefinementPrompt(assetText, brief, diagnosticReport, previousScore),
      },
    ],
  });

  const refinedAsset = response.content[0].type === "text" ? response.content[0].text : assetText;
  const result: RefineResponse = { refinedAsset };
  return NextResponse.json(result);
}
