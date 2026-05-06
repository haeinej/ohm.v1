import Anthropic from "@anthropic-ai/sdk";

/**
 * Extract thinking and text blocks from a Claude response.
 * Throws if no text block is found.
 */
export function extractBlocks(message: Anthropic.Message): {
  thinking: string;
  text: string;
} {
  let thinking = "";
  let text = "";
  for (const block of message.content) {
    if (block.type === "thinking") thinking = block.thinking;
    else if (block.type === "text") text = block.text;
  }
  if (!text) {
    throw new Error("Claude returned no text block");
  }
  return { thinking, text };
}

/**
 * Strip markdown code fences and parse JSON from Claude's response.
 * Handles: ```json\n...\n```, ```\n...\n```, and raw JSON.
 */
export function parseJSON<T>(raw: string): T {
  const stripped = raw
    .replace(/^```\s*(?:json)?\s*\n?/, "")
    .replace(/\n?\s*```\s*$/, "")
    .trim();
  return JSON.parse(stripped) as T;
}

/**
 * Clamp confidence values to [0, 1] range.
 */
export function clampConfidence(val: unknown): number {
  const n = typeof val === "number" ? val : 0;
  return Math.max(0, Math.min(1, n));
}
