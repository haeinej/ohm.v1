export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  narrative: string;
  event_ids: string[];
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

export interface EvidencedClaim {
  inference: string;
  evidence: string[];
  event_ids: string[];
  confidence: number;
}

export interface StableProfile {
  core_pattern: EvidencedClaim;
  operating_mode: EvidencedClaim;
  obsessions: EvidencedClaim[];
  commercial_surfaces: EvidencedClaim[];
  collaboration_style: EvidencedClaim;
  risk_flags: EvidencedClaim[];
  proof_of_work: EvidencedClaim[];
  network_surface: EvidencedClaim[];
  current_leverage_point: EvidencedClaim;
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
