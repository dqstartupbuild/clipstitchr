import type { Metadata } from "next";
import { Suspense } from "react";
import { SwiprPageClient } from "@/app/dashboard/swipr/SwiprPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Swipr | ${site.name}`,
  description:
    "Create vertical TikTok carousel image sets with reusable backgrounds and text overlays.",
  canonical: "/dashboard/swipr",
  noIndex: true,
});

export default function SwiprPage() {
  return (
    <Suspense fallback={null}>
      <SwiprPageClient />
    </Suspense>
  );
}
