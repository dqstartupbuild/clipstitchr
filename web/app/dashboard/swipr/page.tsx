import type { Metadata } from "next";
import { Suspense } from "react";
import { SwiprPageClient } from "@/app/dashboard/swipr/SwiprPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Swipr | ${site.name}`,
  description:
    "Use Swipr to create editable TikTok and Reels carousel drafts when the idea needs slides instead of another video.",
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
