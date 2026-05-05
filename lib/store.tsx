"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { TimelineEvent } from "./types";

interface TimelineState {
  timeline: TimelineEvent[] | null;
  themes: string[] | null;
  setData: (timeline: TimelineEvent[], themes: string[]) => void;
}

const TimelineContext = createContext<TimelineState>({
  timeline: null,
  themes: null,
  setData: () => {},
});

export function TimelineProvider({ children }: { children: ReactNode }) {
  const [timeline, setTimeline] = useState<TimelineEvent[] | null>(null);
  const [themes, setThemes] = useState<string[] | null>(null);

  const setData = (t: TimelineEvent[], th: string[]) => {
    setTimeline(t);
    setThemes(th);
  };

  return (
    <TimelineContext.Provider value={{ timeline, themes, setData }}>
      {children}
    </TimelineContext.Provider>
  );
}

export function useTimeline() {
  return useContext(TimelineContext);
}
