import type { AppUgcClipRoleOption } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipRoleOption";

export const appUgcClipRoleOptions: AppUgcClipRoleOption[] = [
  {
    value: "spoken-hook",
    label: "Spoken hook",
    description: "A creator-led opening line.",
    isSpoken: true,
    minimumDuration: 2,
    maximumDuration: 10,
  },
  {
    value: "silent-reaction",
    label: "Silent reaction",
    description: "One expression or response for overlay text.",
    isSpoken: false,
    minimumDuration: 1,
    maximumDuration: 6,
  },
  {
    value: "lifestyle-b-roll",
    label: "Lifestyle b-roll",
    description: "One useful physical action or setting.",
    isSpoken: false,
    minimumDuration: 2,
    maximumDuration: 8,
  },
  {
    value: "spoken-cta",
    label: "Spoken call to action",
    description: "One clean next-step take.",
    isSpoken: true,
    minimumDuration: 2,
    maximumDuration: 8,
  },
];
