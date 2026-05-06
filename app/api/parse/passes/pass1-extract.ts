import Anthropic from "@anthropic-ai/sdk";
import { AtomicEvent } from "@/lib/types";

export async function pass1Extract(
  anthropic: Anthropic,
  rawText: string
): Promise<{ events: AtomicEvent[]; thinking: string }> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 12000,
    thinking: { type: "enabled", budget_tokens: 8000 },
    messages: [
      {
        role: "user",
        content: `Decompose this text into atomic events. Each event is ONE thing that happened — not an interpretation, not a summary, not a theme. One discrete thing.

For each event extract:
- id: a short unique slug (e.g. "rejected-med-school-2022")
- date_approx: best guess date or range ("2022", "2019-Q3", "early childhood")
- category: one of career, education, relationship, project, insight, crisis, other
- actor: who did this (name or "subject")
- action: verb phrase of what happened
- context: ONE sentence of surrounding context
- significance: 1-5 (5 = life-altering shift, 1 = minor detail)

Return valid JSON only, no markdown wrapping:
{ "events": [ { "id": "...", "date_approx": "...", "category": "...", "actor": "...", "action": "...", "context": "...", "significance": 3 } ] }

Text:
${rawText}`,
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
  return { events: parsed.events, thinking };
}
