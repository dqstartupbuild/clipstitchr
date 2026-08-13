import type { Metadata } from "next";
import { StudioClipsPageClient } from "./StudioClipsPageClient";
import { assertStudioBetaPageAccess } from "@/lib/clipstitchr/server/studio/access/assertStudioBetaPageAccess";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Clips | Studio Beta | ${site.name}`,
  description: "Find, review, and prepare short clips inside ClipStitchr Studio.",
  canonical: "/dashboard/studio/clips",
  noIndex: true,
});

export default async function StudioClipsPage() {
  await assertStudioBetaPageAccess();

  return <StudioClipsPageClient />;
}
