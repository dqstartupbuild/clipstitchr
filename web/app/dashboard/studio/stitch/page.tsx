import type { Metadata } from "next";
import { StudioStitchPageClient } from "@/app/dashboard/studio/stitch/StudioStitchPageClient";
import { assertStudioBetaPageAccess } from "@/lib/clipstitchr/server/studio/access/assertStudioBetaPageAccess";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Stitch | Studio Beta | ${site.name}`,
  description: "Plan, review, and hand off Product-grounded Studio videos.",
  canonical: "/dashboard/studio/stitch",
  noIndex: true,
});

export default async function StudioStitchPage() {
  await assertStudioBetaPageAccess();

  return <StudioStitchPageClient />;
}
