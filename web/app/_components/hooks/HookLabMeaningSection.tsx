import type { HookLabPostAnalysis } from "@/lib/clipstitchr/types/HookLabPostAnalysis";

export function HookLabMeaningSection({
  analysis,
}: {
  analysis: HookLabPostAnalysis;
}) {
  if (
    !analysis.likelySubtext &&
    !analysis.culturalContext &&
    !analysis.recreationEssentials?.length
  ) {
    return null;
  }

  return (
    <section aria-labelledby="hook-lab-report-meaning">
      <h3
        className="text-xl font-bold text-text-primary"
        id="hook-lab-report-meaning"
      >
        Meaning and remake essentials
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        Visible facts stay in the play-by-play. The meaning below is a likely
        reading, not a claim about the creator&apos;s intent.
      </p>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {analysis.likelySubtext ? (
          <div>
            <h4 className="font-bold text-text-primary">Likely subtext</h4>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {analysis.likelySubtext}
            </p>
          </div>
        ) : null}
        {analysis.culturalContext ? (
          <div>
            <h4 className="font-bold text-text-primary">Cultural context</h4>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {analysis.culturalContext}
            </p>
          </div>
        ) : null}
      </div>
      {analysis.recreationEssentials?.length ? (
        <div className="mt-6">
          <h4 className="font-bold text-text-primary">
            Details that carry the effect
          </h4>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-text-secondary">
            {analysis.recreationEssentials.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
