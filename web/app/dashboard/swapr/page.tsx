import type { Metadata } from "next";
import { SwaprPageClient } from "@/app/dashboard/swapr/SwaprPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Swapr | ${site.name}`,
  description:
    "Use Swapr to turn avatar photos and saved videos into another Hook/UGC clip.",
  canonical: "/dashboard/swapr",
  noIndex: true,
});

export default function SwaprPage() {
  return <SwaprPageClient />;
}
