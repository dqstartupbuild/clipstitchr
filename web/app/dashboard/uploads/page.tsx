import type { Metadata } from "next";
import { UploadsPageClient } from "@/app/dashboard/uploads/UploadsPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Uploads | ${site.name}`,
  description:
    "Browse and add normalized ClipStitchr uploads in one browser library with tabs for UGC clips, product demo videos, and Swapr photos.",
  canonical: "/dashboard/uploads",
});

export default function UploadsPage() {
  return <UploadsPageClient />;
}
