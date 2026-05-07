import { Download, Ratio, UploadCloud } from "lucide-react";
import { Panel } from "@/app/_components/ui/Panel";

const features = [
  {
    title: "Upload UGC and demos",
    description:
      "Classify each video as a reaction clip or product demo before processing.",
    icon: UploadCloud,
  },
  {
    title: "Normalize to 9:16",
    description:
      "Convert every upload to a consistent TikTok canvas before it enters the library.",
    icon: Ratio,
  },
  {
    title: "Stitch and download",
    description:
      "Use the same UGC-first sequence for preview, export, and the final MP4.",
    icon: Download,
  },
];

export function LandingFeatureGrid() {
  return (
    <section id="features" className="bg-white px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-4 md:grid-cols-3">
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
