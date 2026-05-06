import Anthropic from "@anthropic-ai/sdk";
import { AtomicEvent, TimelineEvent, StableProfile, EvidencedClaim } from "@/lib/types";
import { MODEL } from "@/lib/constants";
import { extractBlocks, parseJSON, clampConfidence } from "@/lib/llm";

function sanitizeClaim(c: EvidencedClaim): EvidencedClaim {
  return {
    inference: c.inference ?? "",
    evidence: Array.isArray(c.evidence) ? c.evidence : [],
    event_ids: Array.isArray(c.event_ids) ? c.event_ids : [],
    confidence: clampConfidence(c.confidence),
  };
}

function sanitizeClaims(arr: unknown): EvidencedClaim[] {
  if (!Array.isArray(arr)) return [];
  return arr.map(sanitizeClaim);
}

export async function pass3Profile(
  anthropic: Anthropic,
  events: AtomicEvent[],
  timeline: TimelineEvent[],
  themes: string[]
): Promise<{ profile: StableProfile; thinking: string }> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 10000,
    thinking: { type: "enabled", budget_tokens: 8000 },
    messages: [
      {
        role: "user",
        content: `Analyze this person's trajectory and extract their stable profile.

CRITICAL: Separate evidence from inference. Do NOT collapse them.

For each field, return an object with:
- evidence: array of raw factual observations. Things that literally happened — no interpretation, no poetry. Just facts.
- event_ids: array of atomic event IDs that support this claim (use the exact IDs from the atomic events list)
- inference: your interpretation of what these facts mean about this person. This CAN be literary and insightful.
- confidence: number between 0.0 and 1.0 based on how many independent events support this inference. Must be a number, not a string.

Fields (single claim): core_pattern, operating_mode, collaboration_style, current_leverage_point
Fields (array of claims): obsessions, commercial_surfaces, risk_flags, proof_of_work, network_surface

Return valid JSON only, no markdown wrapping, no code fences:
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

  const { thinking, text } = extractBlocks(message);
  const raw = parseJSON<Record<string, unknown>>(text);

  // Sanitize: clamp confidence, ensure arrays, fill missing fields
  const profile: StableProfile = {
    core_pattern: sanitizeClaim(raw.core_pattern as EvidencedClaim),
    operating_mode: sanitizeClaim(raw.operating_mode as EvidencedClaim),
    obsessions: sanitizeClaims(raw.obsessions),
    commercial_surfaces: sanitizeClaims(raw.commercial_surfaces),
    collaboration_style: sanitizeClaim(raw.collaboration_style as EvidencedClaim),
    risk_flags: sanitizeClaims(raw.risk_flags),
    proof_of_work: sanitizeClaims(raw.proof_of_work),
    network_surface: sanitizeClaims(raw.network_surface),
    current_leverage_point: sanitizeClaim(raw.current_leverage_point as EvidencedClaim),
  };

  return { profile, thinking };
}
