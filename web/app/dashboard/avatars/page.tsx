import type { Metadata } from "next";
import { AvatarsPageClient } from "@/app/dashboard/avatars/AvatarsPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Avatars | ${site.name}`,
  description:
    "Manage ClipStitchr avatar photos, upload person references, and generate new scenario photos for Swapr.",
  canonical: "/dashboard/avatars",
  noIndex: true,
});

export default function AvatarsPage() {
  return <AvatarsPageClient />;
}
