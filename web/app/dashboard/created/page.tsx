import type { Metadata } from "next";
import { CreatedVideosPageClient } from "@/app/dashboard/created/CreatedVideosPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Stitches | ${site.name}`,
  description:
    "Browse stitched ClipStitchr exports saved in IndexedDB, preview created 9:16 videos, download finished MP4 files, or remove old outputs.",
  canonical: "/dashboard/created",
});

export default function CreatedPage() {
  return <CreatedVideosPageClient />;
}
