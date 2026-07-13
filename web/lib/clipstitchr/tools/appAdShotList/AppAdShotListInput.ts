import type { AppUgcBriefCreatorStyle } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefCreatorStyle";
import type { AppAdShotListOpeningAngle } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShotListOpeningAngle";
import type { AppAdShotListOpeningCount } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShotListOpeningCount";

export type AppAdShotListInput = {
  appName: string;
  audience: string;
  callToAction: string;
  creatorStyle: AppUgcBriefCreatorStyle;
  desiredOutcome: string;
  openingAngle: AppAdShotListOpeningAngle;
  openingCount: AppAdShotListOpeningCount;
  problem: string;
  productMoment: string;
  proofPoint: string;
};
