import type { LazyReelTeardownRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelTeardownRequest";
import { canonicalizeHookLabSourceUrl } from "@/lib/clipstitchr/server/hookLab/canonicalizeHookLabSourceUrl";
import { getHookLabSourcePlatform } from "@/lib/clipstitchr/server/hookLab/getHookLabSourcePlatform";
import { getLazyReelStringIsUrl } from "./getLazyReelStringIsUrl";
import { lazyReelResearchInputLimits } from "./lazyReelResearchInputLimits";
import { readLazyReelOptionalString } from "./readLazyReelOptionalString";

const models = new Set(["seedance", "kling", "veo", "higgsfield"] as const);

export function readLazyReelTeardownRequest(
  value: Record<string, unknown>,
): LazyReelTeardownRequest {
  const rawVideo = readLazyReelOptionalString(
    value.video ?? value.description,
    "Video description, transcript, or link",
    lazyReelResearchInputLimits.longText,
  );
  const sourcePlatform = rawVideo ? getHookLabSourcePlatform(rawVideo) : null;

  if (rawVideo && getLazyReelStringIsUrl(rawVideo) && !sourcePlatform) {
    throw new Error("Use a public TikTok or Instagram post link.");
  }

  const video = sourcePlatform
    ? canonicalizeHookLabSourceUrl(rawVideo ?? "")
    : rawVideo;
  const product = readLazyReelOptionalString(
    value.product,
    "Product",
    lazyReelResearchInputLimits.shortText,
  );
  const model = readLazyReelOptionalString(value.model, "Video model", 32);

  if (!video && !product) {
    throw new Error("Add a video description, transcript, supported link, or product.");
  }

  if (
    model &&
    !models.has(model as "seedance" | "kling" | "veo" | "higgsfield")
  ) {
    throw new Error("Choose Seedance, Kling, Veo, or Higgsfield.");
  }

  return {
    model: model as LazyReelTeardownRequest["model"],
    niche: readLazyReelOptionalString(
      value.niche,
      "Niche",
      lazyReelResearchInputLimits.shortText,
    ),
    product,
    tool: "teardown",
    trend: readLazyReelOptionalString(
      value.trend,
      "Trend",
      lazyReelResearchInputLimits.shortText,
    ),
    video,
  };
}
