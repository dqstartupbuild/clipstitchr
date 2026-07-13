import type { AppUgcClipRole } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipRole";
import { appUgcClipRoleOptions } from "@/lib/clipstitchr/tools/appUgcClipReadiness/appUgcClipRoleOptions";

export function getAppUgcClipRoleOption(role: AppUgcClipRole) {
  return (
    appUgcClipRoleOptions.find((option) => option.value === role) ??
    appUgcClipRoleOptions[0]
  );
}
