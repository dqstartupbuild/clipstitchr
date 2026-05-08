import { Scissors, Shuffle } from "lucide-react";
import { Panel } from "@/app/_components/ui/Panel";

const studios = [
  {
    eyebrow: "Stitchr",
    title: "Turn creator clips + demos into one ad.",
    description:
      "Choose one creator clip and one product demo. Trim each clip, preview them in order, add simple text, and export a single vertical video.",
    icon: Scissors,
  },
  {
    eyebrow: "Swapr",
    title: "Make a new UGC-style clip from a photo.",
    description:
      "Pick a saved person photo and a saved creator clip. Generate a new clip that follows the source motion, then download it or use it in Stitchr.",
    icon: Shuffle,
  },
];

export function LandingStudioSection() {
  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-accent-dark">
            Two ways to create
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
            Build from existing clips or generate fresh UGC-style content.
          </h2>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {studios.map((studio) => {
            const Icon = studio.icon;

            return (
              <Panel key={studio.eyebrow} className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-accent">
                  <Icon aria-hidden className="h-5 w-5" />
                </div>
                <p className="mt-5 text-sm font-semibold text-accent-dark">
                  {studio.eyebrow}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-text-primary">
                  {studio.title}
                </h3>
                <p className="mt-3 leading-7 text-text-secondary">
                  {studio.description}
                </p>
              </Panel>
            );
          })}
        </div>
      </div>
    </section>
  );
}
