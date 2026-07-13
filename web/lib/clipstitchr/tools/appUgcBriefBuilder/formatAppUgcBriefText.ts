import type { AppUgcBriefResult } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefResult";

export function formatAppUgcBriefText(result: AppUgcBriefResult) {
  return [
    `${result.appName} — UGC AD BRIEF`,
    "",
    "OBJECTIVE",
    result.objective,
    "",
    "AUDIENCE",
    result.audience,
    "",
    "CREATOR DIRECTION",
    result.creatorDirection,
    "",
    "HOOK DIRECTIONS",
    ...result.hookDirections.map((direction) => `- ${direction}`),
    "",
    "SHOT LIST",
    ...result.shotList.map(
      (shot) => `- ${shot.count} x ${shot.title}: ${shot.direction}`,
    ),
    `Total separate files: ${result.deliverables.totalClips}`,
    "",
    "PRODUCT-DEMO HANDOFF",
    result.productDemoHandoff,
    "",
    "PROOF BOUNDARY",
    result.proofBoundary,
    "",
    "CALL TO ACTION",
    result.callToAction,
    "",
    "FILMING CHECKLIST",
    ...result.filmingChecklist.map((item) => `- ${item}`),
  ].join("\n");
}
