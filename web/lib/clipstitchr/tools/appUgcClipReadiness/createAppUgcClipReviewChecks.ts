import type { AppUgcClipAnswers } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipAnswers";
import type { AppUgcClipRole } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipRole";
import { appUgcClipQuestions } from "@/lib/clipstitchr/tools/appUgcClipReadiness/appUgcClipQuestions";
import { getAppUgcClipRoleOption } from "@/lib/clipstitchr/tools/appUgcClipReadiness/getAppUgcClipRoleOption";
import type { VideoCheck } from "@/lib/clipstitchr/tools/localVideoInspection/VideoCheck";

export function createAppUgcClipReviewChecks(
  answers: AppUgcClipAnswers,
  role: AppUgcClipRole,
): VideoCheck[] {
  const isSpoken = getAppUgcClipRoleOption(role).isSpoken;

  return appUgcClipQuestions.map((question) => {
    const isNotApplicable = question.isSpokenOnly && !isSpoken;
    const answer = answers[question.id];

    return {
      id: question.id,
      title: question.prompt,
      status:
        isNotApplicable || answer === "yes"
          ? "pass"
          : answer === "no"
            ? "fail"
            : "warning",
      weight: isNotApplicable ? 0 : question.weight,
      isCritical: question.isCritical,
      observed: isNotApplicable
        ? "Not applicable to this silent clip role."
        : answer === "yes"
          ? "Yes — confirmed by your review."
          : answer === "no"
            ? "No — confirmed by your review."
            : "Not sure yet — watch the clip and decide.",
      target: question.target,
      fix: isNotApplicable || answer === "yes" ? null : question.fix,
    };
  });
}
