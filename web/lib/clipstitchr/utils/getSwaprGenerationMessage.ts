import type { SwaprGenerationStatus } from "@/lib/clipstitchr/types/SwaprGenerationStatus";

export function getSwaprGenerationMessage(status: SwaprGenerationStatus) {
  switch (status) {
    case "uploading":
      return "Uploading selected media to Replicate.";
    case "queued":
      return "Swapr job is queued.";
    case "processing":
      return "Replicate is generating the motion-transfer video.";
    case "downloading":
      return "Downloading the generated output.";
    case "normalizing":
      return "Normalizing the output for ClipStitchr.";
    case "saving":
      return "Saving the output as a UGC clip.";
    case "succeeded":
      return "Swapr output saved to your Swaps tab.";
    case "failed":
      return "Swapr generation failed.";
    case "idle":
    default:
      return "Choose a photo and UGC clip to start.";
  }
}
