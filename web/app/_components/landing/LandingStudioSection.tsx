import { CirclePlay, Shuffle, UserRound } from "lucide-react";
import { Panel } from "@/app/_components/ui/Panel";

const studios = [
  {
    eyebrow: "Clipr",
    title: "Generate reaction and b-roll clips.",
    description:
      "Choose a product and avatar, create a short source clip, and save it into the library for the next ad batch.",
    caption: "Use it like any other saved clip.",
    icon: CirclePlay,
  },
  {
    eyebrow: "Swapr",
    title: "Turn one saved clip into more source footage.",
    description:
      "Pick an avatar photo and an existing clip, create a new UGC-style variation, then save it for future batches.",
    caption: "Useful when the library is thin.",
    icon: Shuffle,
  },
  {
    eyebrow: "Avatars",
    title: "Keep faces ready for new source clips.",
    description:
      "Save avatar photos so Clipr and Swapr have reusable people to work with when you need fresh UGC.",
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
            Never start from an empty library
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
            Need more clips? Generate extra source material for the next batch.
          </h2>
          <p className="mt-4 leading-7 text-text-secondary">
            Clipr, Swapr, and avatar photos are helpers for the same system.
            They fill gaps in your library so the batch workflow has more clips
            to work with.
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
