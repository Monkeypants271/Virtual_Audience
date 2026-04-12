import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const { text } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "nova",
    input: text,
    speed: 1.0,
  });

  const buffer = Buffer.from(await mp3.arrayBuffer());

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": buffer.length.toString(),
    },
  });
}
