import { LayoutTemplate, PenLine, RefreshCcw, Scissors } from "lucide-react";
import { Panel } from "@/app/_components/ui/Panel";

const templateBenefits = [
  {
    title: "Save the setup",
    description:
      "Keep the clips, trims, text, captions, and timing from a finished Stitch.",
    icon: LayoutTemplate,
  },
  {
    title: "Start faster",
    description:
      "Load a template in Stitchr instead of rebuilding the same ad from scratch.",
    icon: RefreshCcw,
  },
  {
    title: "Change what needs changing",
    description:
      "Swap clips or edit the text while the useful parts stay ready.",
    icon: PenLine,
  },
];

export function LandingTemplateSection() {
  return (
    <section id="templates" className="scroll-mt-24 bg-white px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-accent-dark">
            Keep winning structures
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
            When a format works, reuse it without rebuilding everything.
          </h2>
          <p className="mt-4 leading-7 text-text-secondary">
            Turn a finished Stitch into a template, then use it as the starting
            point for the next batch. Keep the trims, text, captions, and timing
            that worked while the clips stay easy to swap.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface-muted p-5 shadow-sm shadow-slate-200/60">
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
            Next time: load it, create the batch, review, export.
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
