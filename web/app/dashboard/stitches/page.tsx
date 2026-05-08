import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { StitchesPageClient } from "@/app/dashboard/stitches/StitchesPageClient";

export const metadata: Metadata = createPageMetadata({
  title: `Stitches | ${site.name}`,
  description:
    "Browse ClipStitchr stitches saved in IndexedDB, preview stitched 9:16 videos, download finished MP4 files, or remove old outputs.",
  canonical: "/dashboard/stitches",
});

export default function StitchesPage() {
  return <StitchesPageClient />;
}
