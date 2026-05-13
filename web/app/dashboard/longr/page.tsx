import type { Metadata } from "next";
import { LongrPageClient } from "@/app/dashboard/longr/LongrPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Longr | ${site.name}`,
  description:
    "Build one long-form vertical video from multiple UGC and demo clips.",
  canonical: "/dashboard/longr",
  noIndex: true,
});

export default function LongrPage() {
  return <LongrPageClient />;
}
