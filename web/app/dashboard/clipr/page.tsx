import type { Metadata } from "next";
import { CliprPageClient } from "@/app/dashboard/clipr/CliprPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Clipr | ${site.name}`,
  description:
    "Use Clipr to make reusable reaction and b-roll source clips when your library is thin and you do not want another shoot.",
  canonical: "/dashboard/clipr",
  noIndex: true,
});

export default function CliprPage() {
  return <CliprPageClient />;
}
