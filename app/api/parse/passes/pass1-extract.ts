import Anthropic from "@anthropic-ai/sdk";
import { AtomicEvent } from "@/lib/types";
import { MODEL } from "@/lib/constants";
import { extractBlocks, parseJSON } from "@/lib/llm";

export async function pass1Extract(
  anthropic: Anthropic,
  rawText: string
): Promise<{ events: AtomicEvent[]; thinking: string }> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 12000,
    thinking: { type: "enabled", budget_tokens: 8000 },
    messages: [
      {
        role: "user",
        content: `Decompose this text into atomic events. Each event is ONE thing that happened — not an interpretation, not a summary, not a theme. One discrete thing.

For each event extract:
- id: a short unique slug (e.g. "rejected-med-school-2022")
- date_approx: best guess date or range ("2022", "2019-Q3", "early childhood"). Use "unknown" if no clue.
- category: one of career, education, relationship, project, insight, crisis, other
- actor: who did this (name or "subject")
- action: verb phrase of what happened
- context: ONE sentence of surrounding context
- significance: 1-5 (5 = life-altering shift, 1 = minor detail)

If the text contains no discernible events, return: { "events": [] }

Return valid JSON only, no markdown wrapping, no code fences:
{ "events": [ { "id": "...", "date_approx": "...", "category": "...", "actor": "...", "action": "...", "context": "...", "significance": 3 } ] }

Text:
${rawText}`,
      },
    ],
  });

  const { thinking, text } = extractBlocks(message);
  const parsed = parseJSON<{ events: AtomicEvent[] }>(text);
  return { events: parsed.events ?? [], thinking };
}
