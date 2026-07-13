import type { AppUgcClipRole } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipRole";

export type AppUgcClipRoleOption = {
  description: string;
  isSpoken: boolean;
  label: string;
  maximumDuration: number;
  minimumDuration: number;
  value: AppUgcClipRole;
};
