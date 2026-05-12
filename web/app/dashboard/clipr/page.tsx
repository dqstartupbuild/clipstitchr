import type { Metadata } from "next";
import { CliprPageClient } from "@/app/dashboard/clipr/CliprPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Clipr | ${site.name}`,
  description:
    "Generate reusable short-form engagement clips for your ClipStitchr library.",
  canonical: "/dashboard/clipr",
  noIndex: true,
});

export default function CliprPage() {
  return <CliprPageClient />;
}
