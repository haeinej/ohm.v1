import Anthropic from "@anthropic-ai/sdk";
import { AtomicEvent, TimelineEvent } from "@/lib/types";

export async function pass2Compress(
  anthropic: Anthropic,
  events: AtomicEvent[]
): Promise<{ timeline: TimelineEvent[]; themes: string[]; thinking: string }> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 11000,
    thinking: { type: "enabled", budget_tokens: 6000 },
    messages: [
      {
        role: "user",
        content: `You have a set of atomic life events. Group them into meaningful life phases and synthesize a compressed timeline.

Rules:
- Each phase represents a meaningful shift, not a sentence summary
- Titles must be sharp and specific (like essay section headers)
- Narratives are 2-4 sentences max, compressed and precise
- You are building a representation of a human trajectory
- Extract 3-5 themes that run across the phases

Return valid JSON only, no markdown wrapping:
{
  "timeline": [
    { "id": "unique-id", "time": "time period", "title": "sharp title", "narrative": "2-4 sentences", "event_ids": ["atomic-event-id-1", "atomic-event-id-2"] }
  ],
  "themes": ["theme1", "theme2", "theme3"]
}

Atomic events:
${JSON.stringify(events, null, 2)}`,
      },
    ],
  });

  let thinking = "";
  let text = "";
  for (const block of message.content) {
    if (block.type === "thinking") thinking = block.thinking;
    else if (block.type === "text") text = block.text;
  }

  const raw = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  const parsed = JSON.parse(raw);
  return { timeline: parsed.timeline, themes: parsed.themes, thinking };
}
