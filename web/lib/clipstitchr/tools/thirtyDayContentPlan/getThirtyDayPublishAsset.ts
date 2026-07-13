import type { ThirtyDayContentPlanInput } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/ThirtyDayContentPlanInput";

export function getThirtyDayPublishAsset(
  input: ThirtyDayContentPlanInput,
  index: number,
) {
  const available = [
    ...(input.hasUgc ? ["UGC source clip"] : []),
    ...(input.hasDemo ? ["clean app demo"] : []),
    ...(input.hasScreenshots ? ["app screenshots"] : []),
  ];

  if (available.length > 0) return available[index % available.length];
  if (input.cameraComfort === "on-camera") return "founder talking take";
  if (input.cameraComfort === "voiceover") return "voiceover and simple text";
  return "text-led post with one product fact";
}
