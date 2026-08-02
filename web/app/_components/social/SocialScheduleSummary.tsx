type SocialScheduleSummaryProps = {
  nextSlot: string | null;
  postCount: number;
  attentionCount: number;
};

export function SocialScheduleSummary({
  nextSlot,
  postCount,
  attentionCount,
}: SocialScheduleSummaryProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-3" aria-label="Schedule summary">
      <div className="rounded-lg bg-surface p-4">
        <p className="text-sm text-text-secondary">Next open product time</p>
        <p className="mt-1 text-base font-bold text-text-primary">
          {nextSlot ? new Date(nextSlot).toLocaleString() : "Queue not active"}
        </p>
      </div>
      <div className="rounded-lg bg-surface p-4">
        <p className="text-sm text-text-secondary">Posts in this view</p>
        <p className="mt-1 text-2xl font-bold text-text-primary">{postCount}</p>
      </div>
      <div className="rounded-lg bg-surface p-4">
        <p className="text-sm text-text-secondary">Need your review</p>
        <p className="mt-1 text-2xl font-bold text-text-primary">
          {attentionCount}
        </p>
      </div>
    </section>
  );
}
