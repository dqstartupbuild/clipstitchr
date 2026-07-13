import type { AppAdShot } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShot";

type AppAdShotCardProps = { shot: AppAdShot };

export function AppAdShotCard({ shot }: AppAdShotCardProps) {
  return (
    <article className="rounded-lg border border-border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-accent-dark">
            {shot.id} · {shot.source}
          </p>
          <h3 className="mt-2 text-lg font-bold text-text-primary">
            {shot.title}
          </h3>
        </div>
        <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-bold text-text-secondary">
          {shot.duration}
        </span>
      </div>
      <dl className="mt-4 grid gap-3 text-sm leading-6">
        <div>
          <dt className="font-bold text-text-primary">Frame</dt>
          <dd className="text-text-secondary">{shot.framing}</dd>
        </div>
        <div>
          <dt className="font-bold text-text-primary">Capture</dt>
          <dd className="text-text-secondary">{shot.action}</dd>
        </div>
        <div>
          <dt className="font-bold text-text-primary">Audio</dt>
          <dd className="text-text-secondary">{shot.audioDirection}</dd>
        </div>
        <div>
          <dt className="font-bold text-text-primary">Why it matters</dt>
          <dd className="text-text-secondary">{shot.purpose}</dd>
        </div>
        <div>
          <dt className="font-bold text-text-primary">Clean handoff</dt>
          <dd className="text-text-secondary">{shot.handoff}</dd>
        </div>
      </dl>
    </article>
  );
}
