import { PricingPage } from "@/app/_components/pricing/PricingPage";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: `Pricing | ${site.name}`,
  description:
    "ClipStitchr pricing for creating ad variants from saved clips, with included Stitchr batches, scoring, templates, and helper credits for generated material.",
  canonical: "/pricing",
  keywords: [
    "ClipStitchr pricing",
    "UGC ad tool pricing",
    "ad variant generator pricing",
    "short-form ad workflow",
  ],
});

export default function PricingRoutePage() {
  return <PricingPage />;
}
