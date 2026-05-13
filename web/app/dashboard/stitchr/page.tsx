import type { Metadata } from "next";
import { StitchrPageClient } from "@/app/dashboard/stitchr/StitchrPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Stitchr | ${site.name}`,
  description:
    "Create vertical ads by combining UGC with product demos using Stitchr.",
  canonical: "/dashboard/stitchr",
  noIndex: true,
});

export default function StitchrPage() {
  return <StitchrPageClient />;
}
