import type { Metadata } from "next";
import { HookLabPageClient } from "@/app/dashboard/hooks/HookLabPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Hook Lab | ${site.name}`,
  description:
    "Analyze public TikTok and Instagram videos or slideshows, then browse a searchable library of proven hook patterns.",
  canonical: "/dashboard/hooks",
  noIndex: true,
});

export default function HookLabPage() {
  return <HookLabPageClient />;
}
