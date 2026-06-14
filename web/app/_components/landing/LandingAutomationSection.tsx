import { Bot, CalendarClock, CirclePause, SlidersHorizontal } from "lucide-react";
import { Panel } from "@/app/_components/ui/Panel";

const automationBenefits = [
  {
    title: "Choose what runs",
    description:
      "Turn Stitchr, Clipr, or Swipr daily drafts on and off from Settings.",
    icon: SlidersHorizontal,
  },
  {
    title: "Get daily drafts",
    description:
      "Let ClipStitchr prepare new drafts during the daily window you already set.",
    icon: CalendarClock,
  },
  {
    title: "Stay in control",
    description:
      "Pause automation anytime and keep every saved draft editable before you use it.",
    icon: CirclePause,
  },
];

export function LandingAutomationSection() {
  return (
    <section id="automation" className="scroll-mt-24 bg-surface-muted px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-accent-dark">
            Automation
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
            Let ClipStitchr make daily drafts while you work on everything else.
          </h2>
          <p className="mt-4 leading-7 text-text-secondary">
            Pick the tools you want running, choose a few defaults, and let the
            app prepare content drafts you can review before anything goes live.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm shadow-slate-200/60">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-md border border-purple-200 bg-purple-50 px-2 py-1 text-xs font-bold text-accent-dark">
                <Bot aria-hidden className="h-4 w-4" />
                Daily drafts
              </p>
              <h3 className="mt-4 text-xl font-bold text-text-primary">
                New drafts, ready to review.
              </h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Automation can prepare Stitchr drafts, new UGC, and Swipes
                based on the tools you choose.
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
            Review first. Edit anything. Post only when it feels right.
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
