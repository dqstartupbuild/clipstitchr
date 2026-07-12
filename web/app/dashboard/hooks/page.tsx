import type { Metadata } from "next";
import { HookLabPageClient } from "@/app/dashboard/hooks/HookLabPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Hook Lab | ${site.name}`,
  description:
    "Save repeatable content ideas, review generated hooks, and turn inspiration into fresh ClipStitchr videos.",
  canonical: "/dashboard/hooks",
  noIndex: true,
});

export default function HookLabPage() {
  return <HookLabPageClient />;
}
