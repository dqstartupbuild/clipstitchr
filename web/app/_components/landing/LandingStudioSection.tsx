import { Images, Scissors, Shuffle, Sparkles } from "lucide-react";
import { Panel } from "@/app/_components/ui/Panel";

const studios = [
  {
    eyebrow: "Stitchr",
    title: "Turn real clips and demos into ads.",
    description:
      "Choose one UGC clip and one product demo. Trim the dead space, preview the ad, add simple text, and create a finished vertical video.",
    caption: "We call these 'Stitches'.",
    icon: Scissors,
  },
  {
    eyebrow: "Clipr",
    title: "Generate engagement Clips for the library.",
    description:
      "Choose a product and avatar, generate a short engagement clip, and save it as source footage for Stitchr.",
    caption: "We call these 'Clips'.",
    icon: Sparkles,
  },
  {
    eyebrow: "Swapr",
    title: "Create new UGC clips when you need more.",
    description:
      "Pick or upload an avatar photo and a UGC clip to make a new UGC clip, then use it in Stitchr like any other UGC clip.",
    caption: "We call these 'Swaps'.",
    icon: Shuffle,
  },
  {
    eyebrow: "Swipr",
    title: "Make carousel posts when video is not the move.",
    description:
      "Start with a product idea, choose a look, edit the slides, and save the carousel so you can come back to it before downloading.",
    caption: "We call these 'Swipes'.",
    icon: Images,
  },
];

export function LandingStudioSection() {
  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-accent-dark">
            Stitch first, generate when needed
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
            The main workflow turns your existing clips into ads. AI helps fill
            the library.
          </h2>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
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
                <p className="mt-4 text-sm font-semibold text-text-tertiary">
                  {studio.caption}
                </p>
              </Panel>
            );
          })}
        </div>
      </div>
    </section>
  );
}
