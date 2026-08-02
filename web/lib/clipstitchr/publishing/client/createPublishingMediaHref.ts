import type { PublishingMediaDescriptor } from "@/lib/clipstitchr/publishing/client/contracts/PublishingMediaDescriptor";

export function createPublishingMediaHref(
  media: PublishingMediaDescriptor,
): string {
  const params = new URLSearchParams({
    kind: media.kind,
    recordId: media.recordId,
  });

  return `/dashboard/publishing/compose?${params.toString()}`;
}
