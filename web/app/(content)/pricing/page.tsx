import { PricingPage } from "@/app/_components/pricing/PricingPage";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: `Pricing | ${site.name}`,
  description:
    "ClipStitchr pricing for turning saved clips and demos into TikTok and Reels ads, with included Stitchr, scores, Hook Lab post analysis, and credits for extra material.",
  canonical: "/pricing",
  keywords: [
    "ClipStitchr pricing",
    "mobile app ad tool pricing",
    "UGC ad tool pricing",
    "TikTok app ad pricing",
    "video ads without editing",
  ],
});

export default function PricingRoutePage() {
  return <PricingPage />;
}
