"use client";

import Link from "next/link";
import { useTimeline } from "@/lib/store";
import { TimelineContainer } from "@/components/TimelineContainer";

export default function TimelinePage() {
  const { timeline, themes } = useTimeline();

  if (!timeline) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <Link href="/" className="text-sm hover:underline">
          Go back to input
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1">
      {themes && themes.length > 0 && (
        <div className="max-w-2xl mx-auto px-6 pt-16">
          <p className="text-xs tracking-widest uppercase">
            {themes.join(" / ")}
          </p>
        </div>
      )}
      <TimelineContainer events={timeline} />
    </main>
  );
}
