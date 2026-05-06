import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";
import { pass1Extract } from "./passes/pass1-extract";
import { pass2Compress } from "./passes/pass2-compress";
import { pass3Profile } from "./passes/pass3-profile";
import { pass4Opportunity } from "./passes/pass4-opportunity";
import { AtomicEvent, TimelineEvent } from "@/lib/types";

async function dbInsert(table: string, data: Record<string, unknown> | Record<string, unknown>[]) {
  if (!supabase) return;
  const { error } = await supabase.from(table).insert(data);
  if (error) console.error(`[DB] Failed to insert into ${table}:`, error.message);
}

async function dbUpdate(table: string, data: Record<string, unknown>, id: string) {
  if (!supabase) return;
  const { error } = await supabase.from(table).update(data).eq("id", id);
  if (error) console.error(`[DB] Failed to update ${table}:`, error.message);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const raw_text = body.raw_text;
  const intent = typeof body.intent === "string" ? body.intent.trim() || null : null;

  if (!raw_text || typeof raw_text !== "string" || !raw_text.trim()) {
    return NextResponse.json({ error: "raw_text is required" }, { status: 400 });
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  // Save raw input
  let inputId: string | null = null;
  if (supabase) {
    const { data: input, error } = await supabase
      .from("inputs")
      .insert({ raw_text, intent })
      .select("id")
      .single();
    if (error) {
      console.error("[DB] Failed to save input:", error.message);
    } else {
      inputId = input.id;
    }
  }

  // Pass 1: Raw text → Atomic events
  console.log("\n--- Pass 1: Extracting atomic events ---");
  let events: AtomicEvent[];
  let t1: string;
  try {
    const result = await pass1Extract(anthropic, raw_text);
    events = result.events;
    t1 = result.thinking;
    console.log(`Extracted ${events.length} atomic events`);
  } catch (err) {
    console.error("[Pass 1] Failed:", err);
    return NextResponse.json({ error: "Failed to extract events from text" }, { status: 500 });
  }

  if (inputId) {
    const rows = events.map((e: AtomicEvent, i: number) => ({
      input_id: inputId,
      date_approx: e.date_approx,
      category: e.category,
      actor: e.actor,
      action: e.action,
      context: e.context,
      significance: e.significance,
      sort_order: i,
    }));
    await dbInsert("atomic_events", rows);
  }

  // Pass 2: Atomic events → Timeline + themes
  console.log("--- Pass 2: Compressing to timeline ---");
  let timeline: TimelineEvent[];
  let themes: string[];
  let t2: string;
  try {
    const result = await pass2Compress(anthropic, events);
    timeline = result.timeline;
    themes = result.themes;
    t2 = result.thinking;
    console.log(`Compressed to ${timeline.length} phases, ${themes.length} themes`);
  } catch (err) {
    console.error("[Pass 2] Failed:", err);
    return NextResponse.json({ error: "Failed to compress timeline" }, { status: 500 });
  }

  if (inputId) {
    const rows = timeline.map((e: TimelineEvent, i: number) => ({
      input_id: inputId,
      time: e.time,
      title: e.title,
      narrative: e.narrative,
      event_ids: e.event_ids ?? [],
      sort_order: i,
    }));
    await dbInsert("timeline_events", rows);
    const themeRows = themes.map((label: string) => ({ input_id: inputId, label }));
    await dbInsert("themes", themeRows);
  }

  // Pass 3: Events + Timeline → Stable profile
  console.log("--- Pass 3: Extracting stable profile ---");
  let profile;
  let t3: string;
  try {
    const result = await pass3Profile(anthropic, events, timeline, themes);
    profile = result.profile;
    t3 = result.thinking;
    console.log("Profile extracted");
  } catch (err) {
    console.error("[Pass 3] Failed:", err);
    return NextResponse.json({ error: "Failed to extract profile" }, { status: 500 });
  }

  if (inputId) {
    await dbInsert("profiles", {
      input_id: inputId,
      core_pattern: profile.core_pattern,
      operating_mode: profile.operating_mode,
      obsessions: profile.obsessions,
      commercial_surfaces: profile.commercial_surfaces,
      collaboration_style: profile.collaboration_style,
      risk_flags: profile.risk_flags,
      proof_of_work: profile.proof_of_work,
      network_surface: profile.network_surface,
      current_leverage_point: profile.current_leverage_point,
    });
  }

  // Pass 4: Profile + intent → Opportunity (conditional)
  let opportunity = undefined;
  let t4 = undefined;
  if (intent) {
    console.log("--- Pass 4: Mapping opportunities ---");
    try {
      const result = await pass4Opportunity(anthropic, profile, intent);
      opportunity = result.opportunity;
      t4 = result.thinking;
      console.log("Opportunity profile generated");

      if (inputId) {
        await dbInsert("opportunity_profiles", {
          input_id: inputId,
          intent: opportunity.intent,
          opportunity_queries: opportunity.opportunity_queries,
          likely_buyers: opportunity.likely_buyers,
          collaboration_matches: opportunity.collaboration_matches,
          positioning: opportunity.positioning,
        });
      }
    } catch (err) {
      console.error("[Pass 4] Failed:", err);
      // Non-fatal: return what we have without opportunity
    }
  }

  // Save all thinking to input record
  if (inputId) {
    await dbUpdate("inputs", {
      reasoning: JSON.stringify({ pass1: t1, pass2: t2, pass3: t3, pass4: t4 }),
    }, inputId);
  }

  return NextResponse.json({
    atomic_events: events,
    timeline,
    themes,
    profile,
    opportunity,
    thinking: { pass1: t1, pass2: t2, pass3: t3, pass4: t4 },
  });
}
