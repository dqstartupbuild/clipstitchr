import type { LazyReelWorkflowKey } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowKey";

export function getLazyReelWorkflowProviderRequirements(workflow: LazyReelWorkflowKey) {
  if (workflow === "higgsfield_director") {
    return [
      "Approved Higgsfield provider account and explicit cost authorization",
      "Approved creator and product reference assets",
      "Per-user and global provider rate-limit reservation before rendering",
      "Idempotent job identity and durable product-owned output paths",
    ];
  }
  if (workflow === "ugc_ad_director") {
    return [
      "Approved Seedance-capable provider and explicit cost authorization",
      "Approved creator and product references",
      "Per-user and global provider rate-limit reservation before rendering",
    ];
  }
  if (workflow === "ugc_ad_generator") {
    return [
      "Server-held fal.ai credential; never client-exposed",
      "Explicit price and spend approval",
      "Per-user and global provider rate-limit reservation before each paid request",
      "Approved product image plus product-claim review",
      "Durable owned paths for clips, logs, manifest, and final edit",
    ];
  }
  if (workflow === "video_editor") {
    return [
      "Media worker with FFmpeg and optional Remotion support",
      "Owned source object references and codec inspection",
      "Idempotent media job reservation and durable output path",
    ];
  }
  return [];
}
