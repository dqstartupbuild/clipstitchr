import type { Metadata } from "next";
import { SwaprPageClient } from "@/app/dashboard/swapr/SwaprPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Swapr | ${site.name}`,
  description:
    "Create UGC clips from avatar photos, UGC clips, and stitches using Swapr.",
  canonical: "/dashboard/swapr",
  noIndex: true,
});

export default function SwaprPage() {
  return <SwaprPageClient />;
}
