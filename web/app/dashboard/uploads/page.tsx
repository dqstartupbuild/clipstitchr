import type { Metadata } from "next";
import { UploadsPageClient } from "@/app/dashboard/uploads/UploadsPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Content Library | ${site.name}`,
  description:
    "Browse and add ClipStitchr content in one library with tabs for UGC clips, demo videos, Swapr outputs, and stitches.",
  canonical: "/dashboard/uploads",
  noIndex: true,
});

export default function UploadsPage() {
  return <UploadsPageClient />;
}
