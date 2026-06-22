import { Panel } from "@/app/_components/ui/Panel";

const workflowSteps = [
  {
    title: "Upload your clips",
    description:
      "Bring in the UGC, b-roll, reactions, and demos you already have. ClipStitchr keeps them ready for vertical ad batches.",
  },
  {
    title: "Pick the product demo",
    description:
      "Choose the demo you want to promote. That demo becomes the anchor for the batch, so every variant points to the same offer.",
  },
  {
    title: "Create the batch",
    description:
      "Click once to turn saved clips into separate finished ad variants with the same demo, text, and export settings.",
  },
];

export function LandingWorkflow() {
  return (
    <section id="workflow" className="scroll-mt-24 px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-accent-dark">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
            One simple flow from saved clips to a finished ad batch.
          </h2>
          <p className="mt-4 leading-7 text-text-secondary">
            Saved clips plus one demo become a set of ad variants you can
            review, download, and test without rebuilding each video by hand.
          </p>
        </div>
        <div className="mt-8 rounded-lg border border-border bg-white p-5 text-center text-lg font-bold text-text-primary shadow-sm shadow-slate-200/60">
          Saved clips + one demo = a batch of ad variants
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
