type VideoReadinessScoreCardProps = {
  description: string;
  percentage: number;
  status: string;
};

export function VideoReadinessScoreCard({
  description,
  percentage,
  status,
}: VideoReadinessScoreCardProps) {
  return (
    <section
      aria-labelledby="video-readiness-score-heading"
      className="rounded-lg border border-accent/30 bg-accent/10 p-5"
    >
      <p className="text-sm font-bold text-accent-dark">Readiness score</p>
      <div className="mt-3 flex flex-wrap items-end gap-x-5 gap-y-2">
        <p className="text-5xl font-black tracking-tight text-text-primary">
          {percentage}%
        </p>
        <h3
          id="video-readiness-score-heading"
          className="pb-1 text-2xl font-bold text-text-primary"
        >
          {status}
        </h3>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
        {description}
      </p>
    </section>
  );
}
