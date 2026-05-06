import Anthropic from "@anthropic-ai/sdk";
import { StableProfile, OpportunityProfile } from "@/lib/types";
import { MODEL } from "@/lib/constants";
import { extractBlocks, parseJSON } from "@/lib/llm";

export async function pass4Opportunity(
  anthropic: Anthropic,
  profile: StableProfile,
  intent: string
): Promise<{ opportunity: OpportunityProfile; thinking: string }> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 7500,
    thinking: { type: "enabled", budget_tokens: 6000 },
    messages: [
      {
        role: "user",
        content: `Given this person's stable profile and their stated intent, generate an intent-bound opportunity map.

Be specific and actionable — real names, platforms, query strings, market segments. Not generic advice.

Intent: "${intent}"

Fields to generate:
- opportunity_queries: specific search queries, outreach messages, or actions this person should take for this intent (array of strings)
- likely_buyers: who would pay for this person's value given this intent — specific types, industries, personas (array of strings)
- collaboration_matches: types of people who complement this person for this intent (array of strings)
- positioning: how to present themselves for this intent — the specific angle, narrative, proof points to lead with (1-2 sentences)

Return valid JSON only, no markdown wrapping, no code fences:
{
  "intent": "${intent}",
  "opportunity_queries": ["..."],
  "likely_buyers": ["..."],
  "collaboration_matches": ["..."],
  "positioning": "..."
}

Profile:
${JSON.stringify(profile, null, 2)}`,
      },
    ],
  });

  const { thinking, text } = extractBlocks(message);
  const opportunity = parseJSON<OpportunityProfile>(text);

  // Ensure arrays exist
  opportunity.opportunity_queries = opportunity.opportunity_queries ?? [];
  opportunity.likely_buyers = opportunity.likely_buyers ?? [];
  opportunity.collaboration_matches = opportunity.collaboration_matches ?? [];
  opportunity.positioning = opportunity.positioning ?? "";
  opportunity.intent = intent;

  return { opportunity, thinking };
}
