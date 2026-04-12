import { NextRequest, NextResponse } from "next/server";
import anthropic, { MODEL } from "@/lib/anthropic";
import { getAudienceAgentSystem } from "@/lib/prompts";
import type { AudienceAgentRequest, AudienceAgentResponse, ICP } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { messages, brief }: AudienceAgentRequest = await req.json();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: getAudienceAgentSystem(brief),
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  const icpMatch = text.match(/<ICP_COMPLETE>([\s\S]*?)<\/ICP_COMPLETE>/);
  let icp: ICP | undefined;
  let complete = false;

  if (icpMatch) {
    try {
      icp = JSON.parse(icpMatch[1].trim()) as ICP;
      complete = true;
    } catch {
      // continue conversation
    }
  }

  const result: AudienceAgentResponse = {
    reply: text.replace(/<ICP_COMPLETE>[\s\S]*?<\/ICP_COMPLETE>/, "").trim(),
    icp,
    complete,
  };

  return NextResponse.json(result);
}
