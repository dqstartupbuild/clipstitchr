import type { Metadata } from "next";
import { StudioBetaWorkspacePageClient } from "@/app/dashboard/studio/StudioBetaWorkspacePageClient";
import { assertStudioBetaPageAccess } from "@/lib/clipstitchr/server/studio/access/assertStudioBetaPageAccess";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Studio Beta | ${site.name}`,
  description: "Open your private ClipStitchr Studio workspace.",
  canonical: "/dashboard/studio",
  noIndex: true,
});

export default async function StudioBetaPage() {
  await assertStudioBetaPageAccess();

  return <StudioBetaWorkspacePageClient />;
}
