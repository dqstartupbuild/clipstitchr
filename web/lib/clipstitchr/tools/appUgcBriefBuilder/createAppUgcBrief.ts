import type { AppUgcBriefInput } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefInput";
import type { AppUgcBriefResult } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefResult";
import { appUgcBriefFilmingChecklist } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/appUgcBriefFilmingChecklist";
import { createAppUgcBriefHookDirections } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/createAppUgcBriefHookDirections";
import { createAppUgcBriefShotList } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/createAppUgcBriefShotList";
import { getAppUgcBriefCreatorDirection } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/getAppUgcBriefCreatorDirection";
import { getAppUgcBriefDeliverables } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/getAppUgcBriefDeliverables";
import { getAppUgcBriefProofBoundary } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/getAppUgcBriefProofBoundary";

export function createAppUgcBrief(
  input: AppUgcBriefInput,
): AppUgcBriefResult {
  const appName = input.appName.trim();
  const audience = input.audience.trim();
  const problem = input.problem.trim();
  const desiredOutcome = input.desiredOutcome.trim();
  const keyFeature = input.keyFeature.trim();
  const callToAction = input.callToAction.trim();
  const deliverables = getAppUgcBriefDeliverables(input.deliverableSize);

  return {
    appName,
    audience,
    problem,
    desiredOutcome,
    keyFeature,
    callToAction,
    objective: `Give ${audience} a recognizable opening about ${problem}, then hand off to a clean ${appName} demo that shows ${keyFeature}.`,
    creatorDirection: getAppUgcBriefCreatorDirection(input),
    deliverables,
    hookDirections: createAppUgcBriefHookDirections(input),
    shotList: createAppUgcBriefShotList({
      creatorStyle: input.creatorStyle,
      deliverables,
    }),
    productDemoHandoff: `End the UGC opening cleanly so a separate ${appName} product demo can show ${keyFeature} and connect it to the outcome: ${desiredOutcome}. Do not record or burn the app interface into the UGC clip.`,
    proofBoundary: getAppUgcBriefProofBoundary(input.proofPoint),
    filmingChecklist: [...appUgcBriefFilmingChecklist],
  };
}
