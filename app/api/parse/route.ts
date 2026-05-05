import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { raw_text, intent } = await req.json();

  let inputId: string | null = null;

  // Save raw input to Supabase (if configured)
  if (supabase) {
    const { data: input } = await supabase
      .from("inputs")
      .insert({ raw_text, intent })
      .select("id")
      .single();
    inputId = input?.id ?? null;
  }

  // Call Claude to extract and structure timeline
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: `You are a biographical intelligence system. You extract life events from raw text and structure them into a compressed timeline.

Rules:
- Each event represents a meaningful shift, not a sentence summary
- Titles must be sharp and specific (like essay section headers)
- Narratives are 2-4 sentences max, compressed and precise
- Infer time periods when not explicitly stated
- No generic summaries, no vague phrases
- You are building a representation of a human trajectory

Return valid JSON only, no markdown wrapping.`,
    messages: [
      {
        role: "user",
        content: `${intent ? `Intent: ${intent}\n\n` : ""}Raw text:\n${raw_text}

Extract a timeline of life events/phases. Return JSON in this exact format:
{
  "timeline": [
    { "id": "unique-id", "time": "time period", "title": "sharp title", "narrative": "2-4 sentences" }
  ],
  "themes": ["theme1", "theme2", "theme3"]
}`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
  }

  const parsed = JSON.parse(content.text);

  // Save timeline events to Supabase (if configured)
  if (supabase && inputId && parsed.timeline) {
    const events = parsed.timeline.map((e: { id: string; time: string; title: string; narrative: string }, i: number) => ({
      input_id: inputId,
      time: e.time,
      title: e.title,
      narrative: e.narrative,
      sort_order: i,
    }));
    await supabase.from("timeline_events").insert(events);
  }

  if (supabase && inputId && parsed.themes) {
    const themes = parsed.themes.map((label: string) => ({
      input_id: inputId,
      label,
    }));
    await supabase.from("themes").insert(themes);
  }

  return NextResponse.json(parsed);
}
