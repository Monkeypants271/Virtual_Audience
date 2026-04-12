import { NextRequest, NextResponse } from "next/server";
import anthropic, { MODEL } from "@/lib/anthropic";
import { getPersonaBatchPrompt } from "@/lib/prompts";
import type { GeneratePersonasRequest, Persona } from "@/lib/types";

export const maxDuration = 60;

async function generateBatch(
  icp: GeneratePersonasRequest["icp"],
  brief: GeneratePersonasRequest["brief"],
  skepticismLevel: "low" | "medium" | "high",
  idOffset: number
): Promise<Persona[]> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: getPersonaBatchPrompt(icp, brief, skepticismLevel, idOffset),
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  const result = JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
  return result.personas ?? [];
}

export async function POST(req: NextRequest) {
  const { icp, brief }: GeneratePersonasRequest = await req.json();

  // Generate 3 batches of 10 in parallel — faster and each fits within timeout
  const [lowBatch, mediumBatch, highBatch] = await Promise.all([
    generateBatch(icp, brief, "low", 0),
    generateBatch(icp, brief, "medium", 10),
    generateBatch(icp, brief, "high", 20),
  ]);

  const personas = [...lowBatch, ...mediumBatch, ...highBatch];
  return NextResponse.json({ personas });
}
