import type { PublishingPostStatus as PublishingPostStatusValue } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostStatus";
import { getPublishingPostStatusLabel } from "@/lib/clipstitchr/publishing/client/getPublishingPostStatusLabel";

type PublishingPostStatusProps = {
  status: PublishingPostStatusValue;
};

export function PublishingPostStatus({ status }: PublishingPostStatusProps) {
  return (
    <span className="publishing-post-status" data-status={status}>
      {getPublishingPostStatusLabel(status)}
    </span>
  );
}
