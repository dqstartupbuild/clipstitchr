import type { AppAdTestPlanWave } from "@/lib/clipstitchr/tools/appAdTestPlan/AppAdTestPlanWave";

type AppAdTestPlanWaveCardProps = {
  wave: AppAdTestPlanWave;
};

export function AppAdTestPlanWaveCard({ wave }: AppAdTestPlanWaveCardProps) {
  return (
    <article className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase text-accent-dark">
          Wave {wave.waveNumber} · Change {wave.variable}
        </p>
        <span
          className={
            wave.status === "ready"
              ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800"
              : "rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800"
          }
        >
          {wave.status === "ready"
            ? `${wave.variantCount} variants`
            : "Needs assets"}
        </span>
      </div>
      <h3 className="mt-3 text-lg font-bold text-text-primary">{wave.name}</h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        {wave.instruction}
      </p>
      <p className="mt-3 text-xs font-semibold leading-5 text-text-tertiary">
        Keep steady: {wave.holdConstant.join(", ")}.
      </p>
    </article>
  );
}
