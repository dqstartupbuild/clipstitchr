import type { Metadata } from "next";
import { StudioEditorPageClient } from "@/app/dashboard/studio/edit/StudioEditorPageClient";
import { assertStudioBetaPageAccess } from "@/lib/clipstitchr/server/studio/access/assertStudioBetaPageAccess";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Edit | Studio Beta | ${site.name}`,
  description: "Build and save layered video edits inside ClipStitchr Studio.",
  canonical: "/dashboard/studio/edit",
  noIndex: true,
});

export default async function StudioEditorPage() {
  await assertStudioBetaPageAccess();

  return <StudioEditorPageClient />;
}
