import { SocialPlatformMark } from "./SocialPlatformMark";
import { getSocialDeliveryStatusLabel } from "@/lib/clipstitchr/social/getSocialDeliveryStatusLabel";
import type { SocialSchedulePost } from "@/lib/clipstitchr/social/types/SocialSchedulePost";

type SocialDeliveryRowProps = {
  target: SocialSchedulePost["targets"][number];
};

export function SocialDeliveryRow({ target }: SocialDeliveryRowProps) {
  return (
    <div className="flex min-w-0 items-start gap-2 py-1">
      <SocialPlatformMark
        platform={target.platform}
        className="mt-0.5 h-4 w-4 shrink-0 text-text-primary"
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-text-primary">
          @{target.username}
        </p>
        <p className="text-xs font-semibold text-text-tertiary">
          {getSocialDeliveryStatusLabel(target.status)}
        </p>
        {target.needsAttentionReason || target.lastErrorMessage ? (
          <p className="mt-1 text-sm leading-6 text-amber-800">
            {target.needsAttentionReason || target.lastErrorMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}
