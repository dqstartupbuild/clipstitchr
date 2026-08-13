import type { StudioClipsRenderRevisionSummary } from "@/lib/clipstitchr/types/studioClips/StudioClipsRenderRevisionSummary";

export function getStudioClipsRenderOperationLabel(
  revision: StudioClipsRenderRevisionSummary,
) {
  if (revision.operationKind === "trim") return "Trimmed clip";
  if (revision.operationKind === "split") return "Split clips";
  if (revision.operationKind === "merge") return "Merged clip";
  if (revision.operationKind === "captions") return "Caption update";
  if (revision.operationKind === "project_style") return "Product style update";
  if (revision.operationKind === "regenerate") return "Regenerated clip";
  if (revision.platformPreset === "instagram_reels") return "Instagram Reels export";
  if (revision.platformPreset === "tiktok") return "TikTok export";
  return "YouTube Shorts export";
}
