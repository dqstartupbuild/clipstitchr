import type { Metadata } from "next";
import { HookLabPageClient } from "@/app/dashboard/hooks/HookLabPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Hook Lab | ${site.name}`,
  description:
    "Save public TikTok and Instagram video posts, then read a timestamped video and performance analysis.",
  canonical: "/dashboard/hooks",
  noIndex: true,
});

export default function HookLabPage() {
  return <HookLabPageClient />;
}
