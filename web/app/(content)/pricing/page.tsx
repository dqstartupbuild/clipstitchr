import { PricingPage } from "@/app/_components/pricing/PricingPage";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata = createPageMetadata({
  title: `Pricing | ${site.name}`,
  description:
    "ClipStitchr pricing for turning saved clips and demos into TikTok, Instagram Reels, and YouTube Shorts ads, with Stitchr, scoring, and Hook Lab.",
  canonical: "/pricing",
  keywords: [
    "ClipStitchr pricing",
    "mobile app ad tool pricing",
    "UGC ad tool pricing",
    "TikTok app ad pricing",
    "YouTube Shorts app ad pricing",
    "video ads without editing",
  ],
});

export default function PricingRoutePage() {
  return <PricingPage />;
}
