import { DeadSpaceSpanCard } from "@/app/_components/tools/dead-space-finder/DeadSpaceSpanCard";
import type { DeadSpaceAnalysis } from "@/lib/clipstitchr/tools/deadSpaceFinder/DeadSpaceAnalysis";

type DeadSpaceFinderResultsProps = {
  analysis: DeadSpaceAnalysis;
};

export function DeadSpaceFinderResults({
  analysis,
}: DeadSpaceFinderResultsProps) {
  return (
    <section className="marketing-card p-5 md:p-6" aria-live="polite">
      <p className="text-sm font-bold text-accent-dark">
        Local analysis complete
      </p>
      <h2 className="marketing-subheading mt-2 text-3xl text-text-primary">
        {analysis.spans.length
          ? `${analysis.spans.length} span${analysis.spans.length === 1 ? "" : "s"} worth reviewing`
          : "No clear low-motion, low-audio spans found"}
      </h2>
      <p className="mt-3 text-sm leading-6 text-text-secondary">
        Sampled {analysis.sampleCount} points across{" "}
        {analysis.duration.toFixed(1)} seconds. This is a review aid, not an
        edit decision: a pause can be useful, and speech can be quiet.
      </p>
      {analysis.spans.length ? (
        <div className="mt-5 grid gap-3">
          {analysis.spans.map((span, index) => (
            <DeadSpaceSpanCard
              index={index}
              key={`${span.start}-${span.end}`}
              span={span}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
