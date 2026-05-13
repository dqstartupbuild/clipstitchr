import type { Metadata } from "next";
import { AvatarsPageClient } from "@/app/dashboard/avatars/AvatarsPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Avatars | ${site.name}`,
  description:
    "Upload photos of people to use as avatars in Swapr for custom UGC.",
  canonical: "/dashboard/avatars",
  noIndex: true,
});

export default function AvatarsPage() {
  return <AvatarsPageClient />;
}
