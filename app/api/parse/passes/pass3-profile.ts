import Anthropic from "@anthropic-ai/sdk";
import { AtomicEvent, TimelineEvent, StableProfile } from "@/lib/types";

export async function pass3Profile(
  anthropic: Anthropic,
  events: AtomicEvent[],
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
        content: `Analyze this person's trajectory and extract their stable profile.

CRITICAL: Separate evidence from inference. Do NOT collapse them.

For each field, return an object with:
- evidence: array of raw factual observations. These must be things that literally happened — no interpretation, no poetry, no "quietly outgrowing." Just facts.
- event_ids: array of atomic event IDs that support this claim (use the exact IDs from the atomic events list)
- inference: your interpretation of what these facts mean about this person. This CAN be literary and insightful.
- confidence: 0-1 based on how many independent events support this inference

Fields (single claim): core_pattern, operating_mode, collaboration_style, current_leverage_point
Fields (array of claims): obsessions, commercial_surfaces, risk_flags, proof_of_work, network_surface

Return valid JSON only, no markdown wrapping:
{
  "core_pattern": { "inference": "...", "evidence": ["fact1", "fact2"], "event_ids": ["id1", "id2"], "confidence": 0.85 },
  "operating_mode": { "inference": "...", "evidence": ["..."], "event_ids": ["..."], "confidence": 0.8 },
  "obsessions": [
    { "inference": "...", "evidence": ["..."], "event_ids": ["..."], "confidence": 0.9 }
  ],
  "commercial_surfaces": [
    { "inference": "...", "evidence": ["..."], "event_ids": ["..."], "confidence": 0.7 }
  ],
  "collaboration_style": { "inference": "...", "evidence": ["..."], "event_ids": ["..."], "confidence": 0.8 },
  "risk_flags": [
    { "inference": "...", "evidence": ["..."], "event_ids": ["..."], "confidence": 0.6 }
  ],
  "proof_of_work": [
    { "inference": "...", "evidence": ["..."], "event_ids": ["..."], "confidence": 0.95 }
  ],
  "network_surface": [
    { "inference": "...", "evidence": ["..."], "event_ids": ["..."], "confidence": 0.8 }
  ],
  "current_leverage_point": { "inference": "...", "evidence": ["..."], "event_ids": ["..."], "confidence": 0.85 }
}

Atomic events:
${JSON.stringify(events, null, 2)}

Compressed timeline:
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
