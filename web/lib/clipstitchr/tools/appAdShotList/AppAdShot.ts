import type { AppAdShotGroup } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShotGroup";
import type { AppAdShotSource } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShotSource";

export type AppAdShot = {
  action: string;
  audioDirection: string;
  duration: string;
  framing: string;
  group: AppAdShotGroup;
  handoff: string;
  id: string;
  purpose: string;
  source: AppAdShotSource;
  title: string;
};
