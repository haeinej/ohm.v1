import Anthropic from "@anthropic-ai/sdk";
import { AtomicEvent, TimelineEvent } from "@/lib/types";
import { MODEL } from "@/lib/constants";
import { extractBlocks, parseJSON } from "@/lib/llm";

export async function pass2Compress(
  anthropic: Anthropic,
  events: AtomicEvent[]
): Promise<{ timeline: TimelineEvent[]; themes: string[]; thinking: string }> {
  const message = await anthropic.messages.create({
    model: MODEL,
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
- Each timeline phase must include event_ids: the IDs of the atomic events it draws from

If there are fewer than 3 events, create 1 phase covering everything.

Return valid JSON only, no markdown wrapping, no code fences:
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

  const { thinking, text } = extractBlocks(message);
  const parsed = parseJSON<{ timeline: TimelineEvent[]; themes: string[] }>(text);
  return {
    timeline: parsed.timeline ?? [],
    themes: parsed.themes ?? [],
    thinking,
  };
}
