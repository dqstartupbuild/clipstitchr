import { LayoutTemplate, PenLine, RefreshCcw, Scissors } from "lucide-react";
import { Panel } from "@/app/_components/ui/Panel";

const templateBenefits = [
  {
    title: "Save the setup",
    description:
      "Keep the trims, text, captions, and timing from the Stitch you would rather not rebuild.",
    icon: LayoutTemplate,
  },
  {
    title: "Skip the blank start",
    description:
      "Load a template instead of recreating the same structure again.",
    icon: RefreshCcw,
  },
  {
    title: "Only change the new parts",
    description:
      "Swap clips or edit the text while the useful parts stay put.",
    icon: PenLine,
  },
];

export function LandingTemplateSection() {
  return (
    <section id="templates" className="scroll-mt-24 bg-background px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="marketing-eyebrow">
            For the part you dread repeating
          </p>
          <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
            Rebuilding the same structure is what makes a new set feel heavy.
          </h2>
          <p className="mt-5 leading-7 text-text-secondary">
            Turn a finished Stitch into a template, then use it as the starting
            point next time. Keep the trims, text, captions, and timing that
            worked while the clips stay easy to swap.
          </p>
        </div>
        <div className="marketing-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-md border border-purple-200 bg-white px-2 py-1 text-xs font-bold text-accent-dark">
                <LayoutTemplate aria-hidden className="h-4 w-4" />
                Saved Template
              </p>
              <h3 className="mt-4 text-xl font-bold text-text-primary">
                Weekend offer opener
              </h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                UGC first, demo second, quick trim, text hook, and caption ready
                to reuse.
              </p>
            </div>
            <Scissors aria-hidden className="h-9 w-9 shrink-0 text-accent" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {["UGC opener", "Product demo", "Text hook", "Caption"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold text-text-primary"
                >
                  {item}
                </div>
              ),
            )}
          </div>
          <div className="mt-5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-text-primary">
            Next time: load it, swap clips, review, export.
          </div>
        </div>
        <div className="grid gap-4 lg:col-span-2 md:grid-cols-3">
          {templateBenefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <Panel key={benefit.title} className="p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-accent">
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
