import type { RawCampaignConcept } from "@/lib/clipstitchr/tools/rawClipsCampaignPlanner/RawCampaignConcept";

type RawCampaignConceptCardProps = {
  concept: RawCampaignConcept;
  index: number;
};

export function RawCampaignConceptCard({
  concept,
  index,
}: RawCampaignConceptCardProps) {
  return (
    <article className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-accent-dark">
            Concept {index + 1}
          </p>
          <h3 className="mt-1 font-bold text-text-primary">{concept.title}</h3>
        </div>
        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent-dark">
          {concept.compatibilityScore}/100 fit
        </span>
      </div>
      <dl className="mt-4 grid gap-2 text-sm">
        <div>
          <dt className="inline font-bold text-text-primary">Hook: </dt>
          <dd className="inline text-text-secondary">{concept.hook.name}</dd>
        </div>
        <div>
          <dt className="inline font-bold text-text-primary">Body: </dt>
          <dd className="inline text-text-secondary">{concept.body.name}</dd>
        </div>
        <div>
          <dt className="inline font-bold text-text-primary">Proof: </dt>
          <dd className="inline text-text-secondary">
            {concept.proof?.name ?? "Capture needed"}
          </dd>
        </div>
        <div>
          <dt className="inline font-bold text-text-primary">CTA: </dt>
          <dd className="inline text-text-secondary">
            {concept.cta?.name ?? "Capture needed"}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-xs leading-5 text-text-tertiary">
        Shared tags: {concept.sharedTags.join(", ") || "none entered"}
      </p>
    </article>
  );
}
