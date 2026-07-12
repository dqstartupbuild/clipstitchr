import { Lightbulb, PenLine, RefreshCcw, Scissors } from "lucide-react";
import { Panel } from "@/app/_components/ui/Panel";

const ideaBenefits = [
  {
    title: "Save what is worth repeating",
    description:
      "Keep a useful line, public post, or finished Stitch without rebuilding the thought from memory.",
    icon: Lightbulb,
  },
  {
    title: "Repeat the idea, not the post",
    description:
      "Hook Lab keeps the writing pattern and creative beat while leaving the source-specific details behind.",
    icon: RefreshCcw,
  },
  {
    title: "Start the next Stitch faster",
    description:
      "Use your product defaults to turn a saved Idea into a fresh, editable Stitch.",
    icon: PenLine,
  },
];

export function LandingIdeaSection() {
  return (
    <section id="hook-lab" className="scroll-mt-24 bg-background px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="marketing-eyebrow">For the good idea you want again</p>
          <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
            Starting from zero is what makes the next post feel heavy.
          </h2>
          <p className="mt-5 leading-7 text-text-secondary">
            Save a line, public post, or past Stitch in Hook Lab. ClipStitchr
            learns the useful pattern and turns it into a fresh Stitch for the
            product you are working on.
          </p>
        </div>
        <div className="marketing-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-md border border-purple-200 bg-white px-2 py-1 text-xs font-bold text-accent-dark">
                <Lightbulb aria-hidden className="h-4 w-4" />
                Saved Idea
              </p>
              <h3 className="mt-4 text-xl font-bold text-text-primary">
                Weekend offer opener
              </h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                A relatable reaction, a quick curiosity turn, and a clean handoff
                into the product Demo.
              </p>
            </div>
            <Scissors aria-hidden className="h-9 w-9 shrink-0 text-accent" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {["Text pattern", "Creative beat", "Saved setup", "Fresh Stitch"].map(
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
            Next time: use the Idea, review the Stitch, make it yours.
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3 lg:col-span-2">
          {ideaBenefits.map((benefit) => {
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
