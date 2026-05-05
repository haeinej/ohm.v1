import { TimelineEvent } from "@/lib/types";

export function TimelineItem({ event }: { event: TimelineEvent }) {
  return (
    <div className="relative pl-8 py-10">
      <div className="absolute left-0 top-12 w-[7px] h-[7px] bg-black rounded-full -translate-x-[3px]" />
      <p className="text-xs tracking-widest uppercase mb-2">{event.time}</p>
      <h3 className="text-base font-medium tracking-tight mb-2">{event.title}</h3>
      <p className="text-sm leading-relaxed">{event.narrative}</p>
    </div>
  );
}
