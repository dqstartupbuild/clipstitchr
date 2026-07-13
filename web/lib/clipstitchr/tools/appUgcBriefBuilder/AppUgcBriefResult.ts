import type { AppUgcBriefDeliverables } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefDeliverables";
import type { AppUgcBriefShot } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefShot";

export type AppUgcBriefResult = {
  appName: string;
  audience: string;
  callToAction: string;
  creatorDirection: string;
  deliverables: AppUgcBriefDeliverables;
  desiredOutcome: string;
  filmingChecklist: string[];
  hookDirections: string[];
  keyFeature: string;
  objective: string;
  problem: string;
  productDemoHandoff: string;
  proofBoundary: string;
  shotList: AppUgcBriefShot[];
};
