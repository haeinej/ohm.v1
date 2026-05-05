export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  narrative: string;
}

export interface ParseResponse {
  timeline: TimelineEvent[];
  themes: string[];
}
