import {
  CirclePlay,
  Gauge,
  Images,
  LayoutTemplate,
  PenLine,
  Shuffle,
} from "lucide-react";
import { Panel } from "@/app/_components/ui/Panel";

const showcaseCards = [
  {
    title: "Batch the ads",
    body: "Turn one product demo and saved opener clips into multiple vertical drafts to review.",
    icon: CirclePlay,
    visual: "batch",
  },
  {
    title: "Hook Lab",
    body: "Write overlay text that sounds less like a prompt and more like something a person would say.",
    icon: PenLine,
    visual: "hook",
  },
  {
    title: "Clip and Stitch scoring",
    body: "Catch weak hooks, slow pacing, and unclear moments before they waste a post.",
    icon: Gauge,
    visual: "score",
  },
  {
    title: "Reusable templates",
    body: "Save the structure that worked so the next batch starts from a proven setup.",
    icon: LayoutTemplate,
    visual: "template",
  },
  {
    title: "Extra source clips",
    body: "Use Clipr and Swapr to create more usable clips when your library is thin.",
    icon: Shuffle,
    visual: "swapr",
  },
  {
    title: "Carousel drafts",
    body: "Use Swipr when the next post should be slides instead of another vertical video.",
    icon: Images,
    visual: "swipr",
  },
];

export function LandingProductShowcase() {
  return (
    <section className="bg-background px-6 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-accent-dark">
            What you get
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
            One system for the parts of content you keep avoiding.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {showcaseCards.map((card) => {
            const Icon = card.icon;
            return (
              <Panel key={card.title} className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-accent">
                  <Icon aria-hidden className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-text-primary">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {card.body}
                </p>
                <div className="mt-4">
                  <ShowcaseVisual variant={card.visual} />
                </div>
              </Panel>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ShowcaseVisual({ variant }: { variant: string }) {
  if (variant === "batch") {
    return (
      <div className="flex gap-1">
        <div className="h-12 w-8 rounded bg-gradient-to-br from-purple-200 to-purple-300" />
        <div className="h-12 w-8 rounded bg-gradient-to-br from-blue-200 to-blue-300" />
        <div className="h-12 w-8 rounded bg-gradient-to-br from-amber-200 to-amber-300" />
      </div>
    );
  }

  if (variant === "hook") {
    return (
      <div className="rounded-md border border-border bg-surface-muted px-2 py-1.5 text-xs font-semibold text-text-primary">
        &ldquo;Stop scrolling if you...&rdquo;
      </div>
    );
  }

  if (variant === "score") {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
          88
        </span>
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
          76
        </span>
        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
          90
        </span>
      </div>
    );
  }

  if (variant === "template") {
    return (
      <div className="rounded-md border border-border bg-surface-muted px-2 py-1.5 text-xs font-semibold text-text-primary">
        Weekend offer opener
      </div>
    );
  }

  if (variant === "swapr") {
    return (
      <div className="flex gap-1">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-200 to-purple-300" />
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-200 to-blue-300" />
      </div>
    );
  }

  if (variant === "swipr") {
    return (
      <div className="flex gap-1">
        <div className="h-10 w-7 rounded bg-gradient-to-br from-purple-200 to-purple-300" />
        <div className="h-10 w-7 rounded bg-gradient-to-br from-blue-200 to-blue-300" />
        <div className="h-10 w-7 rounded bg-gradient-to-br from-amber-200 to-amber-300" />
      </div>
    );
  }

  return null;
}