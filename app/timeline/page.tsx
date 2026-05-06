"use client";

import Link from "next/link";
import { usePipeline } from "@/lib/store";
import { TimelineContainer } from "@/components/TimelineContainer";
import { ProfileSection } from "@/components/ProfileSection";
import { OpportunitySection } from "@/components/OpportunitySection";

export default function TimelinePage() {
  const { timeline, themes, profile, opportunity } = usePipeline();

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
      {profile && <ProfileSection profile={profile} />}
      {opportunity && <OpportunitySection data={opportunity} />}
    </main>
  );
}
