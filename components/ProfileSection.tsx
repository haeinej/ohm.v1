"use client";

import { useState } from "react";
import { StableProfile, EvidencedClaim } from "@/lib/types";

function Claim({ claim }: { claim: EvidencedClaim }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="py-3">
      <button
        onClick={() => setOpen(!open)}
        className="text-left text-sm leading-relaxed hover:underline w-full"
      >
        {claim.inference}
      </button>
      {open && (
        <div className="mt-3 pl-4 border-l border-neutral-200 space-y-2">
          <p className="text-xs tracking-widest uppercase text-neutral-400">
            Evidence ({Math.round(claim.confidence * 100)}% confidence)
          </p>
          <ul className="space-y-1">
            {claim.evidence.map((e, i) => (
              <li key={i} className="text-xs leading-relaxed">{e}</li>
            ))}
          </ul>
          {claim.event_ids.length > 0 && (
            <p className="text-xs text-neutral-400">
              Events: {claim.event_ids.join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ClaimField({ label, claim }: { label: string; claim: EvidencedClaim }) {
  return (
    <div className="py-4">
      <p className="text-xs tracking-widest uppercase mb-1">{label}</p>
      <Claim claim={claim} />
    </div>
  );
}

function ClaimListField({ label, claims }: { label: string; claims: EvidencedClaim[] }) {
  return (
    <div className="py-4">
      <p className="text-xs tracking-widest uppercase mb-1">{label}</p>
      {claims.map((claim, i) => (
        <Claim key={i} claim={claim} />
      ))}
    </div>
  );
}

export function ProfileSection({ profile }: { profile: StableProfile }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <p className="text-xs tracking-widest uppercase mb-8">Stable Profile</p>
      <div className="border-t border-black">
        <ClaimField label="Core Pattern" claim={profile.core_pattern} />
        <ClaimField label="Operating Mode" claim={profile.operating_mode} />
        <ClaimListField label="Obsessions" claims={profile.obsessions} />
        <ClaimListField label="Commercial Surfaces" claims={profile.commercial_surfaces} />
        <ClaimField label="Collaboration Style" claim={profile.collaboration_style} />
        <ClaimListField label="Risk Flags" claims={profile.risk_flags} />
        <ClaimListField label="Proof of Work" claims={profile.proof_of_work} />
        <ClaimListField label="Network Surface" claims={profile.network_surface} />
        <ClaimField label="Current Leverage Point" claim={profile.current_leverage_point} />
      </div>
    </div>
  );
}
