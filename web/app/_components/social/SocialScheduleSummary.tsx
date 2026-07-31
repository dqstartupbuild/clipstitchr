import type { SocialSchedulePost } from "@/lib/clipstitchr/social/types/SocialSchedulePost";

type SocialScheduleSummaryProps = {
  posts: SocialSchedulePost[];
};

const summaryGroups = [
  {
    label: "Scheduled",
    statuses: ["draft", "scheduled"],
  },
  {
    label: "Processing",
    statuses: ["publishing", "waiting_for_user"],
  },
  {
    label: "Posted",
    statuses: ["partially_published", "published"],
  },
  {
    label: "Needs review",
    statuses: ["failed", "held", "needs_attention", "outcome_unknown"],
  },
];

export function SocialScheduleSummary({ posts }: SocialScheduleSummaryProps) {
  return (
    <section
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Schedule summary"
    >
      {summaryGroups.map((group) => (
        <div
          className="rounded-lg border border-border bg-white p-4"
          key={group.label}
        >
          <p className="text-sm font-semibold text-text-secondary">
            {group.label}
          </p>
          <p className="mt-2 text-2xl font-bold tabular-nums text-text-primary">
            {
              posts.filter((post) => group.statuses.includes(post.status))
                .length
            }
          </p>
        </div>
      ))}
    </section>
  );
}
