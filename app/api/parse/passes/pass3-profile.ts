import Anthropic from "@anthropic-ai/sdk";
import { TimelineEvent, StableProfile } from "@/lib/types";

export async function pass3Profile(
  anthropic: Anthropic,
  timeline: TimelineEvent[],
  themes: string[]
): Promise<{ profile: StableProfile; thinking: string }> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 10000,
    thinking: { type: "enabled", budget_tokens: 8000 },
    messages: [
      {
        role: "user",
        content: `Analyze this person's trajectory and extract their stable profile. For each field, cite specific evidence from the timeline. No speculation beyond what the data supports.

Fields to extract:
- core_pattern: the fundamental drive or pattern that explains this person's choices (1-2 sentences)
- operating_mode: how they execute — their working style, decision-making pattern (1-2 sentences)
- obsessions: what they keep returning to, across different contexts (array of strings)
- commercial_surfaces: where they can create or capture value — specific domains, skills, markets (array of strings)
- collaboration_style: how they work with others — leadership style, team dynamics (1-2 sentences)
- risk_flags: blind spots, failure modes, patterns that could undermine them (array of strings)
- proof_of_work: what they have actually built, shipped, or achieved — concrete evidence (array of strings)
- network_surface: communities, institutions, people they are connected to (array of strings)
- current_leverage_point: their single strongest asset or position right now (1 sentence)

Return valid JSON only, no markdown wrapping:
{
  "core_pattern": "...",
  "operating_mode": "...",
  "obsessions": ["..."],
  "commercial_surfaces": ["..."],
  "collaboration_style": "...",
  "risk_flags": ["..."],
  "proof_of_work": ["..."],
  "network_surface": ["..."],
  "current_leverage_point": "..."
}

Timeline:
${JSON.stringify(timeline, null, 2)}

Themes: ${themes.join(", ")}`,
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
  const profile: StableProfile = JSON.parse(raw);
  return { profile, thinking };
}
