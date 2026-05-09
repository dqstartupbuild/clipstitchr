import {
  Download,
  FolderSearch,
  Ratio,
  Scissors,
  Shuffle,
  Type,
  UploadCloud,
} from "lucide-react";
import { Panel } from "@/app/_components/ui/Panel";

const features = [
  {
    title: "Upload clips once",
    description:
      "Bring in UGC clips and product demos so they are ready whenever you need another ad.",
    icon: UploadCloud,
  },
  {
    title: "Make clips ad-ready",
    description:
      "Prepare your videos for vertical ads so UGC and demos work together cleanly.",
    icon: Ratio,
  },
  {
    title: "Organize your library",
    description:
      "Keep UGC, demos, AI clips, and finished stitches in one place.",
    icon: FolderSearch,
  },
  {
    title: "Stitch UGC to demos",
    description:
      "Pair an attention clip with product proof and preview the ad before you create it.",
    icon: Scissors,
  },
  {
    title: "Fill content gaps",
    description:
      "Use AI tools when you need more avatar photos or UGC clips.",
    icon: Shuffle,
  },
  {
    title: "Add simple text hooks",
    description:
      "Place one clear text overlay, choose its style, and control when it appears.",
    icon: Type,
  },
  {
    title: "Download finished ads",
    description:
      "Save finished vertical ad variants and reuse the same library for the next batch.",
    icon: Download,
  },
];

export function LandingFeatureGrid() {
  return (
    <section id="features" className="bg-white px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-accent-dark">
            What it solves
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
            Stop collecting clips you never use.
          </h2>
          <p className="mt-4 leading-7 text-text-secondary">
            ClipStitchr handles the repetitive work between having raw footage
            and shipping marketing content.
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
