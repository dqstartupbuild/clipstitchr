import type { Metadata } from "next";
import { DashboardPageClient } from "@/app/dashboard/DashboardPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Dashboard | ${site.name}`,
  description:
    "Open the Clipr local dashboard to upload UGC and demo videos, normalize clips to TikTok 9:16, and manage browser-stored exports.",
  canonical: "/dashboard",
});

export default function DashboardPage() {
  return <DashboardPageClient />;
}
