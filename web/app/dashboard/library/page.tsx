import type { Metadata } from "next";
import { LibraryPageClient } from "@/app/dashboard/library/LibraryPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Library | ${site.name}`,
  description:
    "Browse your ClipStitchr library for UGC, demos, avatars, templates, Swipes, and stitches.",
  canonical: "/dashboard/library",
  noIndex: true,
});

export default function LibraryPage() {
  return <LibraryPageClient />;
}
