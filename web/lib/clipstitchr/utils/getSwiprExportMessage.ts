import type { SwiprExportStatus } from "@/lib/clipstitchr/types/SwiprExportStatus";

export function getSwiprExportMessage(status: SwiprExportStatus) {
  if (status === "rendering") {
    return "Rendering carousel images.";
  }

  if (status === "complete") {
    return "Carousel ZIP is ready.";
  }

  if (status === "error") {
    return "Unable to export this carousel.";
  }

  return "Ready to export.";
}
