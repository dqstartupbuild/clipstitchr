import {
  Bot,
  CirclePlay,
  FolderSearch,
  Gauge,
  Images,
  LayoutTemplate,
  Scissors,
} from "lucide-react";
import { Panel } from "@/app/_components/ui/Panel";

const features = [
  {
    title: "Batch ad creation",
    description:
      "Create multiple finished vertical ads from saved clips and one product demo.",
    icon: Scissors,
  },
  {
    title: "Clip library",
    description:
      "Keep UGC, demos, generated clips, carousels, and finished ads in one place.",
    icon: FolderSearch,
  },
  {
    title: "Clip and Stitch scoring",
    description:
      "See which source clips and finished ads are strongest before you post.",
    icon: Gauge,
  },
  {
    title: "Reuse saved templates",
    description:
      "Save the ad setup that worked and start future batches from that structure.",
    icon: LayoutTemplate,
  },
  {
    title: "Extra UGC generation",
    description:
      "Use Clipr and Swapr to create more source clips when the library is thin.",
    icon: CirclePlay,
  },
  {
    title: "Carousel drafts",
    description:
      "Use Swipr when the next post should be slides instead of another video.",
    icon: Images,
  },
  {
    title: "Daily draft automation",
    description:
      "Let ClipStitchr prepare drafts you can review before anything goes live.",
    icon: Bot,
  },
];

export function LandingOfferStackSection() {
  return (
    <section id="offer-stack" className="scroll-mt-24 bg-white px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-accent-dark">
            What you get
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
            Everything you need to turn saved clips into a repeatable ad engine.
          </h2>
          <p className="mt-4 leading-7 text-text-secondary">
            The core batch builder creates the ads. The rest of the system helps
            you pick better clips, reuse winners, fill the library, and keep new
            drafts moving.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Panel key={feature.title} className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-muted text-accent">
                  <Icon aria-hidden className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-text-primary">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {feature.description}
                </p>
              </Panel>
            );
          })}
        </div>
      </div>
    </section>
  );
}
