import type { AppUgcBriefCreatorStyle } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefCreatorStyle";

export const appUgcBriefCreatorStyleOptions: Array<{
  label: string;
  value: AppUgcBriefCreatorStyle;
}> = [
  { label: "Direct to camera", value: "direct-to-camera" },
  { label: "Reaction and b-roll", value: "reaction-and-b-roll" },
  { label: "A useful mix", value: "mixed" },
];
