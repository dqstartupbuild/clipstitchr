import type { Metadata } from "next";
import { LibraryPageClient } from "@/app/dashboard/library/LibraryPageClient";
import { getLibraryTabFromSearchParams } from "@/lib/clipstitchr/utils/getLibraryTabFromSearchParams";
import { createPageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = createPageMetadata({
  title: `Library | ${site.name}`,
  description:
    "Browse Hook/UGC clips, demos, avatars, carousel drafts, and finished Stitches.",
  canonical: "/dashboard/library",
  noIndex: true,
});

type LibraryPageProps = {
  searchParams?: Promise<{ tab?: string | string[] }>;
};

export default async function LibraryPage({
  searchParams = Promise.resolve({}),
}: LibraryPageProps = {}) {
  const { tab } = await searchParams;

  const initialTab = getLibraryTabFromSearchParams(
    new URLSearchParams(typeof tab === "string" ? { tab } : undefined),
  );

  return <LibraryPageClient initialTab={initialTab} />;
}
