import type { AppUgcClipReadinessStatus } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipReadinessStatus";
import type { AppUgcClipRole } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipRole";
import { getAppUgcClipRoleOption } from "@/lib/clipstitchr/tools/appUgcClipReadiness/getAppUgcClipRoleOption";
import type { VideoCheck } from "@/lib/clipstitchr/tools/localVideoInspection/VideoCheck";

export function formatAppUgcClipReadinessReport({
  checks,
  percentage,
  role,
  status,
}: {
  checks: VideoCheck[];
  percentage: number;
  role: AppUgcClipRole;
  status: AppUgcClipReadinessStatus;
}) {
  const rows = checks
    .map(
      (check) =>
        `${check.status.toUpperCase()} — ${check.title}\nObserved: ${check.observed}\nTarget: ${check.target}${check.fix ? `\nNext step: ${check.fix}` : ""}`,
    )
    .join("\n\n");
  return `APP UGC CLIP READINESS REPORT\nRole: ${getAppUgcClipRoleOption(role).label}\nStatus: ${status}\nScore: ${percentage}%\n\nAutomatic facts cover playback, audio-track presence, resolution, shape, and duration. Framing, motion, spoken clarity, clean handles, modularity, baked-in treatment, and usage approval are your self-review.\n\n${rows}`;
}
