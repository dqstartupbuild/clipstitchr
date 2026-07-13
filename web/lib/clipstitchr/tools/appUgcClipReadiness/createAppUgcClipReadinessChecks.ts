import type { AppUgcClipAnswers } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipAnswers";
import type { AppUgcClipRole } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipRole";
import { createAppUgcClipAutomaticChecks } from "@/lib/clipstitchr/tools/appUgcClipReadiness/createAppUgcClipAutomaticChecks";
import { createAppUgcClipReviewChecks } from "@/lib/clipstitchr/tools/appUgcClipReadiness/createAppUgcClipReviewChecks";
import type { LocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/LocalVideoInspection";

export function createAppUgcClipReadinessChecks({
  answers,
  inspection,
  role,
}: {
  answers: AppUgcClipAnswers;
  inspection: LocalVideoInspection;
  role: AppUgcClipRole;
}) {
  return [
    ...createAppUgcClipAutomaticChecks(inspection, role),
    ...createAppUgcClipReviewChecks(answers, role),
  ];
}
