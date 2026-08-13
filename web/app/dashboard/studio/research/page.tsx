import type { Metadata } from "next";
import { LazyReelResearchPageClient } from "@/app/dashboard/studio/research/LazyReelResearchPageClient";
import { assertStudioBetaPageAccess } from "@/lib/clipstitchr/server/studio/access/assertStudioBetaPageAccess";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Research | Studio Beta | ${site.name}`,
  description: "Study real short-form patterns inside ClipStitchr Studio.",
  canonical: "/dashboard/studio/research",
  noIndex: true,
});

export default async function StudioResearchPage() {
  await assertStudioBetaPageAccess();

  return <LazyReelResearchPageClient />;
}
