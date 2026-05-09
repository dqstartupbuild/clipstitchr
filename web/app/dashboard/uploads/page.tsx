import type { Metadata } from "next";
import { UploadsPageClient } from "@/app/dashboard/uploads/UploadsPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Content Library | ${site.name}`,
  description:
    "Browse your ClipStitchr library for UGC clips, product demos, swaps, and stitches.",
  canonical: "/dashboard/uploads",
  noIndex: true,
});

export default function UploadsPage() {
  return <UploadsPageClient />;
}
