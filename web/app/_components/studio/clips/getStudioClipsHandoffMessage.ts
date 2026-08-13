import type { StudioClipsHandoffDestination } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsHandoffDestination";

export function getStudioClipsHandoffMessage(
  destination: StudioClipsHandoffDestination,
  state: "available",
) {
  const messages = {
    editor: "Save the accepted clip once, then open it on a populated Studio editor timeline.",
    library: "Save the accepted clip as Product-owned UGC in your Library.",
    stitchr: "Save the accepted clip once, then open it preselected in Studio Stitch.",
  };

  return state === "available" ? messages[destination] : "This destination is unavailable.";
}
