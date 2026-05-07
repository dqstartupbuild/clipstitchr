import type { Metadata } from "next";
import { UploadsPageClient } from "@/app/uploads/UploadsPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Uploads | ${site.name}`,
  description:
    "Browse and add normalized Clipr uploads in one browser library with tabs for UGC clips and product demo videos.",
  canonical: "/uploads",
});

export default function UploadsPage() {
  return <UploadsPageClient />;
}
