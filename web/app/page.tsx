import { LandingPage } from "@/app/_components/landing/LandingPage";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "UGC App Ads and Short-Form App Videos | ClipStitchr",
  description:
    "Turn UGC clips and product demos into finished short-form app ads for TikTok, Instagram Reels, and YouTube Shorts without spending your week editing.",
  canonical: "/",
  keywords: [
    "UGC app ads",
    "short-form app ads",
    "app marketing video tool",
    "mobile app video ads",
    "product demo ads",
  ],
});

export default function Home() {
  return <LandingPage />;
}
