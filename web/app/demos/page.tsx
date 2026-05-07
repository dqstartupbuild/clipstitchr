import type { Metadata } from "next";
import { VideoClipsPageClient } from "@/app/_components/dashboard/VideoClipsPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Demo Videos | ${site.name}`,
  description:
    "Review normalized product demo videos stored in the Clipr browser library, rename or delete saved demos, and pair them with UGC clips.",
  canonical: "/demos",
});

export default function DemosPage() {
  return (
    <VideoClipsPageClient
      clipType="demo"
      eyebrow="Library"
      title="Demo Videos"
      description="Browse the normalized product walkthroughs saved in this browser."
      emptyDescription="Upload product walkthroughs from the dashboard and classify them as Demo."
      sectionId="demo-videos"
    />
  );
}
