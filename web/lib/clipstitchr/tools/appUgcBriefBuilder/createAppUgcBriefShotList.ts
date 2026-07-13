import type { AppUgcBriefCreatorStyle } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefCreatorStyle";
import type { AppUgcBriefDeliverables } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefDeliverables";
import type { AppUgcBriefShot } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefShot";

export function createAppUgcBriefShotList({
  creatorStyle,
  deliverables,
}: {
  creatorStyle: AppUgcBriefCreatorStyle;
  deliverables: AppUgcBriefDeliverables;
}): AppUgcBriefShot[] {
  const hookDirection =
    creatorStyle === "reaction-and-b-roll"
      ? "Capture short opening expressions or actions that can carry an on-screen hook without spoken claims."
      : "Record each opening as its own concise spoken take. Use natural wording instead of memorizing one long script.";

  return [
    {
      count: deliverables.hookTakes,
      direction: hookDirection,
      title: "Hook openings",
    },
    {
      count: deliverables.reactionClips,
      direction:
        "Capture distinct, silent reactions to the frustrating before moment and the useful after moment.",
      title: "Reaction clips",
    },
    {
      count: deliverables.bRollClips,
      direction:
        "Film one simple action per clip that fits the audience's real setting. Avoid montages and product-screen recordings.",
      title: "Everyday b-roll",
    },
    {
      count: deliverables.callToActionTakes,
      direction:
        "Record the approved next step as a separate take. Keep it inviting and do not add urgency that was not supplied.",
      title: "Call-to-action takes",
    },
  ];
}
