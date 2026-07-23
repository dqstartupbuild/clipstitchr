import { HookLabPostMetricRow } from "@/app/_components/hooks/HookLabPostMetricRow";
import { HookLabPostScoreRow } from "@/app/_components/hooks/HookLabPostScoreRow";
import type { HookLabPost } from "@/lib/clipstitchr/types/HookLabPost";

export function HookLabPerformanceSection({ post }: { post: HookLabPost }) {
  if (!post.analysis) {
    return null;
  }

  const { performance } = post.analysis;

  return (
    <div className="grid gap-8">
      <section aria-labelledby="hook-lab-report-metrics">
        <h4
          className="text-balance text-base font-bold text-text-primary"
          id="hook-lab-report-metrics"
        >
          Public platform numbers
        </h4>
        <p className="mt-2 text-pretty text-sm leading-6 text-text-secondary">
          These were available when the post was analyzed. Missing numbers stay
          missing.
        </p>
        <div className="mt-4">
          <HookLabPostMetricRow metrics={post.metrics} />
        </div>
      </section>

      <section aria-labelledby="hook-lab-report-performance">
        <h4
          className="text-balance text-base font-bold text-text-primary"
          id="hook-lab-report-performance"
        >
          Likely performance factors
        </h4>
        <div className="mt-4">
          <HookLabPostScoreRow performance={performance} />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h5 className="font-bold text-text-primary">Engagement</h5>
            <p className="mt-2 text-pretty text-sm leading-6 text-text-secondary">
              {performance.engagementExplanation}
            </p>
          </div>
          <div>
            <h5 className="font-bold text-text-primary">Likely retention</h5>
            <p className="mt-2 text-pretty text-sm leading-6 text-text-secondary">
              {performance.retentionExplanation}
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h5 className="font-bold text-text-primary">What works</h5>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-text-secondary">
              {performance.strengths.map((strength) => (
                <li className="text-pretty" key={strength}>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-text-primary">
              Limits and weak spots
            </h5>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-text-secondary">
              {performance.limitations.map((limitation) => (
                <li className="text-pretty" key={limitation}>
                  {limitation}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-6 text-pretty text-sm leading-6 text-text-secondary">
          <span className="font-bold text-text-primary">Confidence:</span>{" "}
          {performance.confidence}
        </p>
      </section>
    </div>
  );
}
