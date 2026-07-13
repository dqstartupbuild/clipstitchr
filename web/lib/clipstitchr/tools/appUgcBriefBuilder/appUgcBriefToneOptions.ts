import type { AppUgcBriefTone } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefTone";

export const appUgcBriefToneOptions: Array<{
  label: string;
  value: AppUgcBriefTone;
}> = [
  { label: "Calm and relatable", value: "calm" },
  { label: "Energetic", value: "energetic" },
  { label: "Matter of fact", value: "matter-of-fact" },
];
