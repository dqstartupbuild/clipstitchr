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
    title: "Upload clips and photos",
    description:
      "Bring in creator clips, product demos, and person photos from the same upload flow.",
    icon: UploadCloud,
  },
  {
    title: "Make everything vertical",
    description:
      "Turn raw videos and photos into a clean portrait format for short-form channels.",
    icon: Ratio,
  },
  {
    title: "Organize your library",
    description:
      "Search, tag, rename, delete, preview, and keep UGC, demos, photos, and stitches sorted.",
    icon: FolderSearch,
  },
  {
    title: "Stitch creator clips to demos",
    description:
      "Pair a creator clip with a product demo and preview the same order you will export.",
    icon: Scissors,
  },
  {
    title: "Create new UGC-style clips",
    description:
      "Use a saved person photo and a UGC clip to make a new motion-led video for your library.",
    icon: Shuffle,
  },
  {
    title: "Add simple finishing text",
    description:
      "Place one clear text overlay, choose its style, and control when it appears.",
    icon: Type,
  },
  {
    title: "Download ready videos",
    description:
      "Export finished vertical videos and reuse generated clips in your next stitch.",
    icon: Download,
  },
];

export function LandingFeatureGrid() {
  return (
    <section id="features" className="bg-white px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-accent-dark">
            What it can do
          </p>
          <h2 className="mt-3 text-3xl font-bold text-text-primary md:text-4xl">
            Everything you need to turn creative assets into short-form ads.
          </h2>
          <p className="mt-4 leading-7 text-text-secondary">
            ClipStitchr is built for the practical work between collecting
            creator assets and publishing a finished video.
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
