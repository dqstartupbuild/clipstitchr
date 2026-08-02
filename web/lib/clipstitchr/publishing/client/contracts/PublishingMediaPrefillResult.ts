import type { PublishingMediaDescriptor } from "@/lib/clipstitchr/publishing/client/contracts/PublishingMediaDescriptor";

export type PublishingMediaPrefillResult = {
  descriptor: PublishingMediaDescriptor | null;
  error: string | null;
};
