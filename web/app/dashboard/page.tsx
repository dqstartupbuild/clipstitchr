import type { Metadata } from "next";
import { DashboardPageClient } from "@/app/dashboard/DashboardPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Dashboard | ${site.name}`,
  description:
    "Open the ClipStitchr dashboard to manage saved UGC, product demos, drafts, source clips, and finished ads without reopening the content mess.",
  canonical: "/dashboard",
  noIndex: true,
});

export default function DashboardPage() {
  return <DashboardPageClient />;
}
