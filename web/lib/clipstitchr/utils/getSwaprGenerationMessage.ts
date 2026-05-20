import type { SwaprGenerationStatus } from "@/lib/clipstitchr/types/SwaprGenerationStatus";

export function getSwaprGenerationMessage(status: SwaprGenerationStatus) {
  switch (status) {
    case "uploading":
      return "Preparing your selected photo and clip.";
    case "queued":
      return "Waiting for swap to begin.";
    case "processing":
      return "Swapping...";
    case "downloading":
      return "Getting the finished clip.";
    case "normalizing":
      return "Preparing the clip for your library.";
    case "stitching":
      return "Stitching swapped segments.";
    case "saving":
      return "Saving the clip to your library.";
    case "succeeded":
      return "New clip saved to your library.";
    case "failed":
      return "Swap failed. Please try again.";
    case "idle":
    default:
      return "Choose a photo and UGC clip to start.";
  }
}
