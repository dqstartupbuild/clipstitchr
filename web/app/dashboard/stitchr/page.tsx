import type { Metadata } from "next";
import { StitchrPageClient } from "@/app/dashboard/stitchr/StitchrPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Stitchr | ${site.name}`,
  description:
    "Use Stitchr to preview one normalized UGC clip followed by one demo video, then export a TikTok-ready MP4.",
  canonical: "/dashboard/stitchr",
  noIndex: true,
});

export default function StitchrPage() {
  return <StitchrPageClient />;
}
