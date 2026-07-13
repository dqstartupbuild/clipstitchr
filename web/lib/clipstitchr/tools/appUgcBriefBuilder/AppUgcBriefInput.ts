import type { AppUgcBriefCreatorStyle } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefCreatorStyle";
import type { AppUgcBriefDeliverableSize } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefDeliverableSize";
import type { AppUgcBriefTone } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefTone";

export type AppUgcBriefInput = {
  appName: string;
  audience: string;
  problem: string;
  desiredOutcome: string;
  keyFeature: string;
  proofPoint: string;
  creatorStyle: AppUgcBriefCreatorStyle;
  tone: AppUgcBriefTone;
  callToAction: string;
  deliverableSize: AppUgcBriefDeliverableSize;
};
