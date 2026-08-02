import { SocialPlatformMark } from "./SocialPlatformMark";
import { getSocialDeliveryStatusLabel } from "@/lib/clipstitchr/social/getSocialDeliveryStatusLabel";
import type { SocialSchedulePost } from "@/lib/clipstitchr/social/types/SocialSchedulePost";

type SocialDeliveryRowProps = {
  target: SocialSchedulePost["targets"][number];
};

export function SocialDeliveryRow({
  target,
}: SocialDeliveryRowProps) {
  return (
    <div className="grid gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="flex min-w-0 items-start gap-3">
        <SocialPlatformMark
          platform={target.platform}
          className="mt-0.5 h-4 w-4 shrink-0 text-text-primary"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-primary">
            @{target.username}
          </p>
          <p className="text-sm text-text-secondary">
            {getSocialDeliveryStatusLabel(target.status)}
          </p>
          {target.needsAttentionReason || target.lastErrorMessage ? (
            <p className="mt-1 text-sm leading-6 text-amber-200">
              {target.needsAttentionReason || target.lastErrorMessage}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
