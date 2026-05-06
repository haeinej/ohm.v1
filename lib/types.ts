export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  narrative: string;
}

export interface AtomicEvent {
  id: string;
  date_approx: string;
  category: "career" | "education" | "relationship" | "project" | "insight" | "crisis" | "other";
  actor: string;
  action: string;
  context: string;
  significance: number;
}

export interface StableProfile {
  core_pattern: string;
  operating_mode: string;
  obsessions: string[];
  commercial_surfaces: string[];
  collaboration_style: string;
  risk_flags: string[];
  proof_of_work: string[];
  network_surface: string[];
  current_leverage_point: string;
}

export interface OpportunityProfile {
  intent: string;
  opportunity_queries: string[];
  likely_buyers: string[];
  collaboration_matches: string[];
  positioning: string;
}

export interface PipelineThinking {
  pass1: string;
  pass2: string;
  pass3: string;
  pass4?: string;
}

export interface PipelineResponse {
  atomic_events: AtomicEvent[];
  timeline: TimelineEvent[];
  themes: string[];
  profile: StableProfile;
  opportunity?: OpportunityProfile;
  thinking: PipelineThinking;
}
