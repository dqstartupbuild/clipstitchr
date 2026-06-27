import type { Metadata } from "next";
import { HookLabPageClient } from "@/app/dashboard/hooks/HookLabPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Hook Lab | ${site.name}`,
  description:
    "Review saved hooks, keep winning lines, and tune the writing memory for new ClipStitchr videos.",
  canonical: "/dashboard/hooks",
  noIndex: true,
});

export default function HookLabPage() {
  return <HookLabPageClient />;
}
