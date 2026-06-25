import { Panel } from "@/app/_components/ui/Panel";

const workflowSteps = [
  {
    number: "01",
    title: "Save your source clips",
    description:
      "Keep UGC, b-roll, reactions, demos, avatars, and finished drafts in one place.",
    visual: "library",
  },
  {
    number: "02",
    title: "Build batches around one demo",
    description:
      "Pick the product demo once. ClipStitchr pairs it with saved openers so you are not dragging the same video around all day.",
    visual: "batch",
  },
  {
    number: "03",
    title: "Score before you post",
    description:
      "See weak hooks, slow pacing, unclear moments, and simple fixes before an ad wastes a post.",
    visual: "score",
  },
  {
    number: "04",
    title: "Reuse what worked",
    description:
      "Turn a finished Stitch into a template so the next batch starts from a proven structure.",
    visual: "template",
  },
];

export function LandingWorkflow() {
  return (
    <section id="workflow" className="scroll-mt-24 bg-white px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-accent-dark">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
            From saved clips to testable ads in four steps.
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {workflowSteps.map((step) => (
            <Panel key={step.number} className="p-6">
              <div className="flex items-start gap-4">
                <span className="text-3xl font-bold text-accent-dark">
                  {step.number}
                </span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-text-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">
                    {step.description}
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <WorkflowVisual variant={step.visual} />
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowVisual({ variant }: { variant: string }) {
  if (variant === "library") {
    return (
      <div className="rounded-lg border border-border bg-surface-muted p-3">
        <div className="grid grid-cols-4 gap-2">
          <div className="aspect-[9/16] rounded bg-gradient-to-br from-purple-200 to-purple-300" />
          <div className="aspect-[9/16] rounded bg-gradient-to-br from-blue-200 to-blue-300" />
          <div className="aspect-[9/16] rounded bg-gradient-to-br from-amber-200 to-amber-300" />
          <div className="aspect-[9/16] rounded bg-gradient-to-br from-green-200 to-green-300" />
        </div>
      </div>
    );
  }

  if (variant === "batch") {
    return (
      <div className="rounded-lg border border-border bg-surface-muted p-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded bg-white p-2 text-center text-xs font-semibold text-text-primary">
            Demo
          </div>
          <div className="text-xs text-text-tertiary">+</div>
          <div className="flex-1 rounded bg-white p-2 text-center text-xs font-semibold text-text-primary">
            UGC
          </div>
          <div className="text-xs text-text-tertiary">→</div>
          <div className="flex-1 rounded bg-accent p-2 text-center text-xs font-semibold text-white">
            5 drafts
          </div>
        </div>
      </div>
    );
  }

  if (variant === "score") {
    return (
      <div className="rounded-lg border border-border bg-surface-muted p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-text-primary">Hook</span>
          <span className="font-bold text-green-600">88</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-[88%] rounded-full bg-green-500" />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="font-semibold text-text-primary">Pace</span>
          <span className="font-bold text-amber-600">76</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-[76%] rounded-full bg-amber-500" />
        </div>
      </div>
    );
  }

  if (variant === "template") {
    return (
      <div className="rounded-lg border border-border bg-surface-muted p-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded bg-white px-2 py-1 font-semibold text-text-primary">
            UGC opener
          </span>
          <span className="rounded bg-white px-2 py-1 font-semibold text-text-primary">
            Demo
          </span>
          <span className="rounded bg-white px-2 py-1 font-semibold text-text-primary">
            Text hook
          </span>
        </div>
        <p className="mt-2 text-[10px] text-text-tertiary">
          Saved as template, ready to reuse
        </p>
      </div>
    );
  }

  return null;
}