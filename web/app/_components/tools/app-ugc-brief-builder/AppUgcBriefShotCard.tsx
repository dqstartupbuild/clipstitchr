import type { AppUgcBriefShot } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefShot";

type AppUgcBriefShotCardProps = {
  shot: AppUgcBriefShot;
};

export function AppUgcBriefShotCard({ shot }: AppUgcBriefShotCardProps) {
  return (
    <article className="rounded-lg border border-border bg-surface-muted/45 p-4">
      <p className="text-xs font-bold uppercase text-accent-dark">
        {shot.count} separate {shot.count === 1 ? "clip" : "clips"}
      </p>
      <h3 className="mt-2 text-base font-bold text-text-primary">
        {shot.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        {shot.direction}
      </p>
    </article>
  );
}
