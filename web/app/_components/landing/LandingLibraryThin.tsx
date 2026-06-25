import { CirclePlay, Shuffle, UserRound } from "lucide-react";
import { Panel } from "@/app/_components/ui/Panel";

const thinCards = [
  {
    eyebrow: "Clipr",
    title: "Create a talking-head style source clip from an avatar and product context.",
    icon: CirclePlay,
  },
  {
    eyebrow: "Swapr",
    title: "Create a fresh UGC-style variation from an existing clip or avatar.",
    icon: Shuffle,
  },
  {
    eyebrow: "Avatars",
    title: "Keep reusable faces ready for new source clips.",
    icon: UserRound,
  },
];

export function LandingLibraryThin() {
  return (
    <section className="bg-white px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-accent-dark">
            When the library is thin
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
            When you do not have enough usable clips, make more source material.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {thinCards.map((card) => {
            const Icon = card.icon;
            return (
              <Panel key={card.eyebrow} className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-accent">
                  <Icon aria-hidden className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-semibold text-accent-dark">
                  {card.eyebrow}
                </p>
                <p className="mt-2 text-base leading-7 text-text-primary">
                  {card.title}
                </p>
              </Panel>
            );
          })}
        </div>
      </div>
    </section>
  );
}