import type { Metadata } from "next";
import { LibraryPageClient } from "@/app/dashboard/library/LibraryPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Library | ${site.name}`,
  description:
    "Browse opener clips, demos, templates, carousel drafts, and finished Stitches without hunting through folders.",
  canonical: "/dashboard/library",
  noIndex: true,
});

export default function LibraryPage() {
  return <LibraryPageClient />;
}
