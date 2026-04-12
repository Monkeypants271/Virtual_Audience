import { NextRequest, NextResponse } from "next/server";
import anthropic, { MODEL } from "@/lib/anthropic";
import { BRIEF_AGENT_SYSTEM } from "@/lib/prompts";
import type { BriefAgentRequest, BriefAgentResponse, CampaignBrief } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { messages }: BriefAgentRequest = await req.json();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: BRIEF_AGENT_SYSTEM,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  // Check if the agent has completed the brief
  const briefMatch = text.match(/<BRIEF_COMPLETE>([\s\S]*?)<\/BRIEF_COMPLETE>/);
  let brief: CampaignBrief | undefined;
  let complete = false;

  if (briefMatch) {
    try {
      brief = JSON.parse(briefMatch[1].trim()) as CampaignBrief;
      complete = true;
    } catch {
      // JSON parse failed — continue conversation
    }
  }

  const result: BriefAgentResponse = {
    reply: text.replace(/<BRIEF_COMPLETE>[\s\S]*?<\/BRIEF_COMPLETE>/, "").trim(),
    brief,
    complete,
  };

  return NextResponse.json(result);
}
