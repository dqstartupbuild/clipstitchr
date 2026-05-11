import type { CliprGenerationStatus } from "@/lib/clipstitchr/types/CliprGenerationStatus";

export function getCliprGenerationMessage(status: CliprGenerationStatus) {
  switch (status) {
    case "scripting":
      return "Writing the clip";
    case "generating":
      return "Starting generation";
    case "avatar":
      return "Generating the scene video";
    case "downloading":
      return "Downloading the video";
    case "normalizing":
      return "Preparing the video";
    case "stitching":
      return "Joining segments";
    case "saving":
      return "Saving to library";
    case "succeeded":
      return "Clip saved";
    case "failed":
      return "Clip generation failed";
    case "idle":
    default:
      return "Ready to create";
  }
}
