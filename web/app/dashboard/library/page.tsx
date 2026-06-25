import type { Metadata } from "next";
import { LibraryPageClient } from "@/app/dashboard/library/LibraryPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Library | ${site.name}`,
  description:
    "Browse the ClipStitchr library for UGC, demos, source clips, templates, carousel drafts, and finished ads without hunting through folders.",
  canonical: "/dashboard/library",
  noIndex: true,
});

export default function LibraryPage() {
  return <LibraryPageClient />;
}
