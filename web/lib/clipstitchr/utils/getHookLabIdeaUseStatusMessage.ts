import type { HookLabIdeaUseProgress } from "@/lib/clipstitchr/types/HookLabIdeaUseProgress";

export function getHookLabIdeaUseStatusMessage(
  progress: HookLabIdeaUseProgress,
) {
  const completedCount = progress.completedVariantCount;
  const failedCount = progress.failedVariantCount;
  const totalCount = progress.variationCount;
  const remainingCount = Math.max(0, totalCount - completedCount - failedCount);

  if (totalCount === 1) {
    if (completedCount === 1) {
      return "Your Stitch is ready to review.";
    }

    if (failedCount === 1 || progress.status === "failed") {
      return "This Stitch couldn’t be finished.";
    }

    return progress.status === "queued"
      ? "Your Stitch is waiting to start."
      : "Your Stitch is being created.";
  }

  if (completedCount === totalCount) {
    return `All ${totalCount} Stitches are ready to review.`;
  }

  if (failedCount === totalCount || progress.status === "failed") {
    return `None of these ${totalCount} Stitches could be finished.`;
  }

  if (completedCount > 0 && failedCount > 0 && remainingCount > 0) {
    return `${completedCount} ready, ${failedCount} couldn’t finish, and ${remainingCount} still in progress.`;
  }

  if (completedCount > 0 && remainingCount > 0) {
    return `${completedCount} of ${totalCount} Stitches ${completedCount === 1 ? "is" : "are"} ready. ${remainingCount} still in progress.`;
  }

  if (failedCount > 0 && remainingCount > 0) {
    return `${failedCount} couldn’t finish. ${remainingCount} still in progress.`;
  }

  if (progress.status === "partial") {
    return `${completedCount} of ${totalCount} Stitches ${completedCount === 1 ? "is" : "are"} ready. ${failedCount} couldn’t be finished.`;
  }

  return progress.status === "queued"
    ? `Your ${totalCount} Stitches are waiting to start.`
    : `Your ${totalCount} Stitches are being created.`;
}
