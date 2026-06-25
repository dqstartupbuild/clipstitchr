import { Panel } from "@/app/_components/ui/Panel";

const workflowSteps = [
  {
    title: "Stop hunting for files",
    description:
      "Drop in the UGC, b-roll, reactions, and demos once. They stay in a library instead of whatever folder you swore you would organize later.",
  },
  {
    title: "Stop rebuilding the same ad",
    description:
      "Pick the demo once. ClipStitchr pairs it with saved opener clips so you are not dragging the same product video around all afternoon.",
  },
  {
    title: "Stop exporting one by one",
    description:
      "Create a set of finished vertical ads, review the ones worth using, and get back to the app you actually wanted to work on.",
  },
];

export function LandingWorkflow() {
  return (
    <section id="workflow" className="scroll-mt-24 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-accent-dark">
            The part you can stop doing
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
            No timeline archaeology. No naming files like final-final-2.
          </h2>
          <p className="mt-4 leading-7 text-text-secondary">
            ClipStitchr turns clips and a demo into finished short-form ads
            without making you become an editor for the day.
          </p>
        </div>
        <div className="mt-8 rounded-lg border border-border bg-white p-5 text-center text-lg font-bold text-text-primary shadow-sm shadow-slate-200/60">
          Clips + product demo = ads you can actually test
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {workflowSteps.map((step, index) => (
            <Panel key={step.title} className="p-6">
              <span className="text-xs font-semibold text-text-tertiary">
                Step {index + 1}
              </span>
              <h3 className="mt-3 text-xl font-bold text-text-primary">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                {step.description}
              </p>
            </Panel>
          ))}
        </div>
      </div>
    </section>
  );
}
