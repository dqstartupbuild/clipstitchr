import type { SocialPublishingContentDecayBucket } from "@/lib/clipstitchr/types/SocialPublishingContentDecayBucket";

type SocialPublishingContentLifespanSectionProps = {
  buckets: SocialPublishingContentDecayBucket[];
};

export function SocialPublishingContentLifespanSection({
  buckets,
}: SocialPublishingContentLifespanSectionProps) {
  return (
    <section className="rounded-lg bg-surface p-5 sm:p-6" aria-labelledby="content-lifespan">
      <h2 id="content-lifespan" className="text-xl font-bold text-text-primary">
        Content lifespan
      </h2>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        How much of a post&apos;s final engagement typically arrives in each window.
      </p>
      {buckets.length ? (
        <div className="mt-5 grid gap-4">
          {buckets.map((bucket) => (
            <div key={bucket.order}>
              <div className="flex items-baseline justify-between gap-4 text-sm">
                <span className="font-bold text-text-primary">{bucket.label}</span>
                <span className="font-semibold text-text-secondary">
                  {bucket.averagePercentOfFinal.toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.min(100, Math.max(0, bucket.averagePercentOfFinal))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-sm font-semibold text-text-tertiary">
          Content lifespan appears after Zernio has enough dated engagement history.
        </p>
      )}
    </section>
  );
}
