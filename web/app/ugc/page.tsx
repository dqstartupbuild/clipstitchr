import type { Metadata } from "next";
import { VideoClipsPageClient } from "@/app/_components/dashboard/VideoClipsPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `UGC Clips | ${site.name}`,
  description:
    "Review normalized user-generated reaction clips stored in the Clipr browser library, rename or delete saved clips, and open the create flow when ready.",
  canonical: "/ugc",
});

export default function UgcPage() {
  return (
    <VideoClipsPageClient
      clipType="ugc"
      eyebrow="Library"
      title="UGC Clips"
      description="Browse the normalized reaction clips saved in this browser."
      emptyDescription="Upload reaction clips from the dashboard and classify them as UGC."
      sectionId="ugc-clips"
    />
  );
}
