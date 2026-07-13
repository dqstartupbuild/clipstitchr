import { Lightbulb, ShieldCheck, Shuffle } from "lucide-react";
import { Panel } from "@/app/_components/ui/Panel";

const previewItems = [
  {
    description: "A short opening line ready for an ad or text overlay.",
    icon: Lightbulb,
    title: "8 finished hooks",
  },
  {
    description: "A simple label that explains the creative direction.",
    icon: Shuffle,
    title: "A mix of angles",
  },
  {
    description: "Template-backed lines without invented stats or testimonials.",
    icon: ShieldCheck,
    title: "No made-up proof",
  },
];

export function AppHookGeneratorEmptyState() {
  return (
    <Panel className="p-5 md:p-6">
      <p className="marketing-eyebrow">What you will get</p>
      <h2 className="marketing-subheading mt-4 text-3xl text-text-primary">
        Eight starting points, not eight vague prompts.
      </h2>
      <p className="mt-3 leading-7 text-text-secondary">
        Every result comes with an angle and a quick explanation, so you can
        choose a hook that fits the ad you actually want to make.
      </p>
      <div className="mt-6 grid gap-3">
        {previewItems.map((item) => {
          const Icon = item.icon;

          return (
            <article
              className="flex gap-3 rounded-lg border border-border bg-surface-muted p-4"
              key={item.title}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent-dark">
                <Icon aria-hidden className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-text-secondary">
                  {item.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </Panel>
  );
}
