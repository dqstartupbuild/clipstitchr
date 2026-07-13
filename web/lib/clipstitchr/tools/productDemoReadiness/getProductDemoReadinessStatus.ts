import type { ProductDemoReadinessStatus } from "@/lib/clipstitchr/tools/productDemoReadiness/ProductDemoReadinessStatus";
import type { VideoCheckScore } from "@/lib/clipstitchr/tools/localVideoInspection/VideoCheckScore";

export function getProductDemoReadinessStatus({
  hasCriticalFailure,
  percentage,
}: VideoCheckScore): ProductDemoReadinessStatus {
  if (hasCriticalFailure || percentage < 60) {
    return "Needs another pass";
  }

  return percentage >= 80 ? "Ready to test" : "Nearly ready";
}
