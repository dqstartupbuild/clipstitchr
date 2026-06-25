import { CirclePlay, Shuffle, UserRound } from "lucide-react";
import { Panel } from "@/app/_components/ui/Panel";

const studios = [
  {
    eyebrow: "Clipr",
    title: "Make the reaction clip you do not want to film.",
    description:
      "Choose a product and avatar, create a short source clip, and save it for the next Stitch.",
    caption: "Use it like any other saved clip.",
    icon: CirclePlay,
  },
  {
    eyebrow: "Swapr",
    title: "Squeeze another usable clip out of what you have.",
    description:
      "Pick an avatar photo and an existing clip, create a new UGC-style variation, then save it for later.",
    caption: "Useful when the library is thin.",
    icon: Shuffle,
  },
  {
    eyebrow: "Avatars",
    title: "Keep reusable faces ready.",
    description:
      "Save avatar photos so Clipr and Swapr have people to work with when you need fresh UGC.",
    caption: "Source material stays reusable.",
    icon: UserRound,
  },
];

export function LandingStudioSection() {
  return (
    <section className="bg-white px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-accent-dark">
            When the library is too thin
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
            Sometimes the problem is just not having enough usable clips.
          </h2>
          <p className="mt-4 leading-7 text-text-secondary">
            Clipr, Swapr, and avatar photos fill gaps in your library, so you
            are not stuck waiting on another shoot just to keep moving.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
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
