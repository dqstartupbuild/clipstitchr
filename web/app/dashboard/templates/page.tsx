import type { Metadata } from "next";
import { TemplatesPageClient } from "@/app/dashboard/templates/TemplatesPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Templates | ${site.name}`,
  description:
    "Manage saved Stitchr templates so your best ad setups are easy to reuse.",
  canonical: "/dashboard/templates",
  noIndex: true,
});

export default function TemplatesPage() {
  return <TemplatesPageClient />;
}
