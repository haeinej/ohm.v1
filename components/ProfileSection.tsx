import { StableProfile } from "@/lib/types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-6">
      <p className="text-xs tracking-widest uppercase mb-2">{label}</p>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export function ProfileSection({ profile }: { profile: StableProfile }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <p className="text-xs tracking-widest uppercase mb-8">Stable Profile</p>
      <div className="border-t border-black">
        <Field label="Core Pattern">{profile.core_pattern}</Field>
        <Field label="Operating Mode">{profile.operating_mode}</Field>
        <Field label="Obsessions"><List items={profile.obsessions} /></Field>
        <Field label="Commercial Surfaces"><List items={profile.commercial_surfaces} /></Field>
        <Field label="Collaboration Style">{profile.collaboration_style}</Field>
        <Field label="Risk Flags"><List items={profile.risk_flags} /></Field>
        <Field label="Proof of Work"><List items={profile.proof_of_work} /></Field>
        <Field label="Network Surface"><List items={profile.network_surface} /></Field>
        <Field label="Current Leverage Point">{profile.current_leverage_point}</Field>
      </div>
    </div>
  );
}
