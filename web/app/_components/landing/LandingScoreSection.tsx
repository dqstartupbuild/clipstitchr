import { Gauge, SearchCheck, Scissors, WandSparkles } from "lucide-react";
import { Panel } from "@/app/_components/ui/Panel";

const scoreBenefits = [
  {
    title: "Find the wrong clips sooner",
    description:
      "See the clips that probably do not belong before you build ads around them.",
    icon: SearchCheck,
  },
  {
    title: "Fix the obvious drag",
    description:
      "Get plain notes on the opener, pace, clarity, and short-form fit.",
    icon: Scissors,
  },
  {
    title: "Check the finished ad",
    description:
      "Score a saved Stitch before it becomes the thing you regret posting.",
    icon: WandSparkles,
  },
];

const scorePreviewMetrics = [
  { label: "Hook", value: 88 },
  { label: "On camera", value: 82 },
  { label: "Pace", value: 76 },
  { label: "Stitch fit", value: 90 },
];

export function LandingScoreSection() {
  return (
    <section id="scores" className="scroll-mt-24 bg-surface-muted px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-accent-dark">
            Before you post the wrong thing
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
            Nobody wants to discover a clip was bad after running the ad.
          </h2>
          <p className="mt-4 leading-7 text-text-secondary">
            Clip and Stitch scores give you a quick read on weak openers, slow
            pacing, unclear moments, and simple fixes before the ad leaves the
            app.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm shadow-slate-200/60">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-md border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-bold text-accent-dark">
                <Gauge aria-hidden className="h-4 w-4" />
                Worth checking - 84
              </p>
              <h3 className="mt-4 text-xl font-bold text-text-primary">
                Strong opener, one annoying pause.
              </h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                The first second is clear, the face stays easy to see, and the
                product moment shows up before the clip wanders.
              </p>
            </div>
            <p className="shrink-0 text-4xl font-bold text-accent-dark">84</p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {scorePreviewMetrics.map((metric) => (
              <div key={metric.label}>
                <div className="flex items-center justify-between gap-3 text-xs font-semibold text-text-secondary">
                  <span>{metric.label}</span>
                  <span>{metric.value}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-md bg-surface-muted px-3 py-2 text-sm font-semibold text-text-primary">
            Quick fix: Cut the pause before the demo and try a shorter first
            line.
          </div>
        </div>
        <div className="grid gap-4 lg:col-span-2 md:grid-cols-3">
          {scoreBenefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <Panel key={benefit.title} className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-accent">
                  <Icon aria-hidden className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-text-primary">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {benefit.description}
                </p>
              </Panel>
            );
          })}
        </div>
      </div>
    </section>
  );
}
