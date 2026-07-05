import { ChevronRight, Library, Scissors, Upload } from "lucide-react";

const workflowSteps = [
  {
    title: "Upload once",
    description:
      "Drop Hook/UGC clips and product demos into one place. ClipStitchr keeps originals untouched and normalizes the working versions for short-form.",
    icon: Upload,
  },
  {
    title: "Build your library",
    description:
      "Browse, tag, trim, and keep Hook/UGC clips findable. Your library gets easier to use instead of becoming another folder you avoid.",
    icon: Library,
  },
  {
    title: "Stitch and ship",
    description:
      "Pair Hook/UGC clips with your product demo. One session can turn a set of clips into finished ads ready to review.",
    icon: Scissors,
  },
];

export function LandingWorkflow() {
  return (
    <section id="workflow" className="scroll-mt-24 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="marketing-eyebrow mx-auto">How it works</p>
          <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
            Three steps. Zero timelines.
          </h2>
          <p className="mt-5 text-base leading-7 text-text-secondary">
            ClipStitchr turns clips and a demo into finished short-form ads
            without making content production the thing that eats your day.
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article className="marketing-card relative p-6" key={step.title}>
                <p className="marketing-heading absolute right-5 top-4 text-6xl text-accent/10">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent-dark">
                  <Icon aria-hidden className="h-5 w-5" />
                </div>
                <h3 className="marketing-subheading mt-5 text-2xl text-text-primary">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  {step.description}
                </p>
                {index < workflowSteps.length - 1 ? (
                  <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-background p-1 text-text-tertiary md:block">
                    <ChevronRight aria-hidden className="h-4 w-4" />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
