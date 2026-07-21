import type { Metadata } from "next";
import { Suspense } from "react";
import { CliprPageClient } from "@/app/dashboard/clipr/CliprPageClient";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Clipr | ${site.name}`,
  description:
    "Use Clipr to make reusable Hook/UGC reaction and b-roll clips when your library is thin and you do not want another shoot.",
  canonical: "/dashboard/clipr",
  noIndex: true,
});

export default function CliprPage() {
  return (
    <Suspense fallback={null}>
      <CliprPageClient />
    </Suspense>
  );
}
