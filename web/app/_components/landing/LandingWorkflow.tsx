import { Panel } from "@/app/_components/ui/Panel";

const steps = [
  "Upload",
  "Organize",
  "Pick UGC",
  "Pick Demo",
  "Create",
  "Download",
];

export function LandingWorkflow() {
  return (
    <section id="workflow" className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-accent-dark">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
            Start with the clips you have. Leave with an ad you can use.
          </h2>
          <p className="mt-4 leading-7 text-text-secondary">
            Build a reusable library, choose the UGC and demo that belong
            together, make quick trims, and create another finished ad variant.
          </p>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {steps.map((step, index) => (
            <Panel key={step} className="p-4">
              <span className="text-xs font-semibold text-text-tertiary">
                Step {index + 1}
              </span>
              <h3 className="mt-2 text-base font-bold text-text-primary">
                {step}
              </h3>
            </Panel>
          ))}
        </div>
      </div>
    </section>
  );
}
