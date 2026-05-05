import { TimelineEvent } from "@/lib/types";
import { TimelineItem } from "./TimelineItem";

export function TimelineContainer({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="relative max-w-2xl mx-auto px-6 py-16">
      <div className="absolute left-6 top-0 bottom-0 w-px bg-black" />
      {events.map((event) => (
        <TimelineItem key={event.id} event={event} />
      ))}
    </div>
  );
}
