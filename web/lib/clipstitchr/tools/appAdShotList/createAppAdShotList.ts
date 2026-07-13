import type { AppAdShotListInput } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShotListInput";
import type { AppAdShotListResult } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShotListResult";
import { createAppAdContextShot } from "@/lib/clipstitchr/tools/appAdShotList/createAppAdContextShot";
import { createAppAdCtaShot } from "@/lib/clipstitchr/tools/appAdShotList/createAppAdCtaShot";
import { createAppAdDemoShot } from "@/lib/clipstitchr/tools/appAdShotList/createAppAdDemoShot";
import { createAppAdOpeningShots } from "@/lib/clipstitchr/tools/appAdShotList/createAppAdOpeningShots";
import { createAppAdOutcomeShot } from "@/lib/clipstitchr/tools/appAdShotList/createAppAdOutcomeShot";
import { createAppAdProofShot } from "@/lib/clipstitchr/tools/appAdShotList/createAppAdProofShot";

export function createAppAdShotList(
  input: AppAdShotListInput,
): AppAdShotListResult {
  const proofShot = createAppAdProofShot(input);
  const shots = [
    ...createAppAdOpeningShots(input),
    createAppAdContextShot(input),
    createAppAdDemoShot(input),
    createAppAdOutcomeShot(input),
    ...(proofShot ? [proofShot] : []),
    createAppAdCtaShot(input),
  ];

  return {
    appName: input.appName.trim(),
    objective: `Capture separate source clips that help ${input.audience.trim()} recognize ${input.problem.trim()}, then show how ${input.appName.trim()} handles ${input.productMoment.trim()}.`,
    recordingChecklist: [
      "Record vertically and keep the important face, hands, or action near the center.",
      "Capture two takes of each planned file, then deliver the cleaner take as its own clip.",
      "Leave a short clean beat before and after every action or spoken line.",
      "Keep UGC and product-demo footage in separate files.",
      "Do not bake in music, captions, watermarks, transitions, or unapproved proof.",
    ],
    shots,
    totalPlannedFiles: shots.length,
    totalRecommendedTakes: shots.length * 2,
  };
}
