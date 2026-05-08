import type { Metadata } from "next";
import { SwaprPageClient } from "@/app/dashboard/swapr/SwaprPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Swapr | ${site.name}`,
  description:
    "Use Swapr to generate AI UGC by pairing a saved person photo with motion from an uploaded ClipStitchr UGC video.",
  canonical: "/dashboard/swapr",
  noIndex: true,
});

export default function SwaprPage() {
  return <SwaprPageClient />;
}
