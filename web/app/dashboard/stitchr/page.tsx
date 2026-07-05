import type { Metadata } from "next";
import { StitchrPageClient } from "@/app/dashboard/stitchr/StitchrPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Stitchr | ${site.name}`,
  description:
    "Use Stitchr to turn saved Hook/UGC clips and product demos into finished vertical ads.",
  canonical: "/dashboard/stitchr",
  noIndex: true,
});

export default function StitchrPage() {
  return <StitchrPageClient />;
}
