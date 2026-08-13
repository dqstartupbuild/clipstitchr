import type { StudioClipsHandoffDestination } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsHandoffDestination";

export async function materializeStudioClipsOutputHandoff(
  destination: StudioClipsHandoffDestination,
  materialize: () => Promise<{ libraryClipId: string } | null>,
  onUpdated: () => void,
  navigate: (href: string) => void,
) {
  const result = await materialize();
  if (!result) {
    return;
  }

  onUpdated();
  const destinations: Record<StudioClipsHandoffDestination, string> = {
    editor: `/dashboard/studio/edit?sourceId=${encodeURIComponent(result.libraryClipId)}`,
    library: "/dashboard/library?tab=ugc",
    stitchr: `/dashboard/studio/stitch?sourceId=${encodeURIComponent(result.libraryClipId)}`,
  };
  navigate(destinations[destination]);
}
