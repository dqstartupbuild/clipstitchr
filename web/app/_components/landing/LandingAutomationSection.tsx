import { Bot, CalendarClock, CirclePause, SlidersHorizontal } from "lucide-react";
import { Panel } from "@/app/_components/ui/Panel";

const automationBenefits = [
  {
    title: "Choose what runs",
    description:
      "Pick which draft types ClipStitchr can prepare from Settings.",
    icon: SlidersHorizontal,
  },
  {
    title: "Find new drafts waiting",
    description:
      "Give it a daily window and review what it made when you are ready.",
    icon: CalendarClock,
  },
  {
    title: "Keep final say",
    description:
      "Pause it anytime and edit every draft before you use it.",
    icon: CirclePause,
  },
];

export function LandingAutomationSection() {
  return (
    <section
      id="automation"
      className="scroll-mt-24 bg-surface-muted/45 px-6 py-24"
    >
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="marketing-eyebrow">
            Daily drafts
          </p>
          <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
            Showing up daily is hard when you do not like social.
          </h2>
          <p className="mt-5 leading-7 text-text-secondary">
            Daily drafts exist so consistency does not depend on you waking up
            excited to make content. Choose the tools, set a few defaults, and
            review everything before anything leaves the app.
          </p>
        </div>
        <div className="marketing-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-md border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-bold text-accent-dark">
                <Bot aria-hidden className="h-4 w-4" />
                Daily drafts
              </p>
              <h3 className="mt-4 text-xl font-bold text-text-primary">
                Drafts you can review, not posts you have to trust.
              </h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                ClipStitchr can prepare stitched ads, Hook/UGC clips, and
                carousel drafts based on the tools you choose.
              </p>
            </div>
            <CalendarClock aria-hidden className="h-9 w-9 shrink-0 text-accent" />
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {["Stitchr", "Clipr", "Swipr"].map(
              (tool) => (
                <div
                  key={tool}
                  className="rounded-md border border-border bg-surface-muted px-3 py-2 text-sm font-semibold text-text-primary"
                >
                  {tool}
                </div>
              ),
            )}
          </div>
          <div className="mt-5 rounded-md bg-surface-muted px-3 py-2 text-sm font-semibold text-text-primary">
            Review first. Edit anything. Use only the drafts that feel right.
          </div>
        </div>
        <div className="grid gap-4 lg:col-span-2 md:grid-cols-3">
          {automationBenefits.map((benefit) => {
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
