import { OpportunityProfile } from "@/lib/types";

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

export function OpportunitySection({ data }: { data: OpportunityProfile }) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <p className="text-xs tracking-widest uppercase mb-2">Opportunity Map</p>
      <p className="text-sm mb-8">Intent: {data.intent}</p>
      <div className="border-t border-black">
        <Field label="Opportunity Queries"><List items={data.opportunity_queries} /></Field>
        <Field label="Likely Buyers"><List items={data.likely_buyers} /></Field>
        <Field label="Collaboration Matches"><List items={data.collaboration_matches} /></Field>
        <Field label="Positioning">{data.positioning}</Field>
      </div>
    </div>
  );
}
