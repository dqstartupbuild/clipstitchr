import type { Metadata } from "next";
import { CreateVideoPageClient } from "@/app/dashboard/create/CreateVideoPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Create Video | ${site.name}`,
  description:
    "Use the Clipr create studio to preview one normalized UGC clip followed by one demo video, then export a TikTok-ready MP4.",
  canonical: "/dashboard/create",
});

export default function CreateVideoPage() {
  return <CreateVideoPageClient />;
}
