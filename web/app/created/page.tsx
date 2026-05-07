import type { Metadata } from "next";
import { CreatedVideosPageClient } from "@/app/created/CreatedVideosPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Created Videos | ${site.name}`,
  description:
    "Browse stitched Clipr exports saved in IndexedDB, preview created 9:16 videos, download finished MP4 files, or remove old outputs.",
  canonical: "/created",
});

export default function CreatedPage() {
  return <CreatedVideosPageClient />;
}
