import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";
import { pass1Extract } from "./passes/pass1-extract";
import { pass2Compress } from "./passes/pass2-compress";
import { pass3Profile } from "./passes/pass3-profile";
import { pass4Opportunity } from "./passes/pass4-opportunity";
import { AtomicEvent, TimelineEvent, StableProfile } from "@/lib/types";

export async function POST(req: NextRequest) {
  const { raw_text, intent } = await req.json();

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  // Save raw input
  let inputId: string | null = null;
  if (supabase) {
    const { data: input } = await supabase
      .from("inputs")
      .insert({ raw_text, intent })
      .select("id")
      .single();
    inputId = input?.id ?? null;
  }

  // Pass 1: Raw text → Atomic events
  console.log("\n--- Pass 1: Extracting atomic events ---");
  const { events, thinking: t1 } = await pass1Extract(anthropic, raw_text);
  console.log(`Extracted ${events.length} atomic events`);
  console.log("Thinking:", t1.slice(0, 200), "...\n");

  if (supabase && inputId) {
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
    await supabase.from("atomic_events").insert(rows);
  }

  // Pass 2: Atomic events → Timeline + themes
  console.log("--- Pass 2: Compressing to timeline ---");
  const { timeline, themes, thinking: t2 } = await pass2Compress(anthropic, events);
  console.log(`Compressed to ${timeline.length} phases, ${themes.length} themes`);
  console.log("Thinking:", t2.slice(0, 200), "...\n");

  if (supabase && inputId) {
    const rows = timeline.map((e: TimelineEvent, i: number) => ({
      input_id: inputId,
      time: e.time,
      title: e.title,
      narrative: e.narrative,
      sort_order: i,
    }));
    await supabase.from("timeline_events").insert(rows);
    const themeRows = themes.map((label: string) => ({ input_id: inputId, label }));
    await supabase.from("themes").insert(themeRows);
  }

  // Pass 3: Timeline → Stable profile
  console.log("--- Pass 3: Extracting stable profile ---");
  const { profile, thinking: t3 } = await pass3Profile(anthropic, timeline, themes);
  console.log("Profile extracted");
  console.log("Thinking:", t3.slice(0, 200), "...\n");

  if (supabase && inputId) {
    await supabase.from("profiles").insert({
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
    const result = await pass4Opportunity(anthropic, profile, intent);
    opportunity = result.opportunity;
    t4 = result.thinking;
    console.log("Opportunity profile generated");
    console.log("Thinking:", t4.slice(0, 200), "...\n");

    if (supabase && inputId) {
      await supabase.from("opportunity_profiles").insert({
        input_id: inputId,
        intent: opportunity.intent,
        opportunity_queries: opportunity.opportunity_queries,
        likely_buyers: opportunity.likely_buyers,
        collaboration_matches: opportunity.collaboration_matches,
        positioning: opportunity.positioning,
      });
    }
  }

  // Save all thinking to input record
  if (supabase && inputId) {
    await supabase.from("inputs").update({
      reasoning: JSON.stringify({ pass1: t1, pass2: t2, pass3: t3, pass4: t4 }),
    }).eq("id", inputId);
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
