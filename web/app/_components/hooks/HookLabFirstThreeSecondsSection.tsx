import type { HookLabFormatDna } from "@/lib/clipstitchr/types/HookLabFormatDna";

export function HookLabFirstThreeSecondsSection({
  formatDna,
}: {
  formatDna: HookLabFormatDna;
}) {
  return (
    <section aria-labelledby="hook-lab-first-three-seconds">
      <h3
        className="text-xl font-bold text-text-primary"
        id="hook-lab-first-three-seconds"
      >
        The first three seconds
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        This is a close read of the opening, not a promise that one pattern will
        perform the same way for every account.
      </p>
      <dl className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-semibold text-text-primary">First frame</dt>
          <dd className="mt-2 text-sm leading-6 text-text-secondary">
            {formatDna.openingVisual}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-text-primary">
            Open question
          </dt>
          <dd className="mt-2 text-sm leading-6 text-text-secondary">
            {formatDna.openingQuestion}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-text-primary">
            Works without sound
          </dt>
          <dd className="mt-2 text-sm leading-6 text-text-secondary">
            {formatDna.soundOffSummary}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-text-primary">
            First taste of the payoff
          </dt>
          <dd className="mt-2 text-sm leading-6 text-text-secondary">
            {formatDna.firstPayoff}
            {formatDna.firstPayoffAtSeconds === undefined
              ? ""
              : ` Around ${formatDna.firstPayoffAtSeconds.toFixed(1)}s.`}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-text-primary">
            When the pitch becomes clear
          </dt>
          <dd className="mt-2 text-sm leading-6 text-text-secondary">
            {formatDna.adObviousness}
          </dd>
        </div>
      </dl>
    </section>
  );
}
