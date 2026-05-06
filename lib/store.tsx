"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import {
  AtomicEvent,
  TimelineEvent,
  StableProfile,
  OpportunityProfile,
  PipelineResponse,
} from "./types";

interface PipelineState {
  atomicEvents: AtomicEvent[] | null;
  timeline: TimelineEvent[] | null;
  themes: string[] | null;
  profile: StableProfile | null;
  opportunity: OpportunityProfile | null;
  setData: (data: PipelineResponse) => void;
}

const PipelineContext = createContext<PipelineState>({
  atomicEvents: null,
  timeline: null,
  themes: null,
  profile: null,
  opportunity: null,
  setData: () => {},
});

export function TimelineProvider({ children }: { children: ReactNode }) {
  const [atomicEvents, setAtomicEvents] = useState<AtomicEvent[] | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[] | null>(null);
  const [themes, setThemes] = useState<string[] | null>(null);
  const [profile, setProfile] = useState<StableProfile | null>(null);
  const [opportunity, setOpportunity] = useState<OpportunityProfile | null>(null);

  const setData = (data: PipelineResponse) => {
    setAtomicEvents(data.atomic_events);
    setTimeline(data.timeline);
    setThemes(data.themes);
    setProfile(data.profile);
    setOpportunity(data.opportunity ?? null);
  };

  return (
    <PipelineContext.Provider
      value={{ atomicEvents, timeline, themes, profile, opportunity, setData }}
    >
      {children}
    </PipelineContext.Provider>
  );
}

export function usePipeline() {
  return useContext(PipelineContext);
}
