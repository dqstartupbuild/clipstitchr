import type { AppAdShotListOpeningAngle } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShotListOpeningAngle";

export const appAdShotListOpeningAngleOptions: Array<{
  label: string;
  value: AppAdShotListOpeningAngle;
}> = [
  { label: "Audience callout", value: "audience-callout" },
  { label: "Problem first", value: "problem-first" },
  { label: "Outcome first", value: "outcome-first" },
  { label: "Demo first", value: "demo-first" },
];
