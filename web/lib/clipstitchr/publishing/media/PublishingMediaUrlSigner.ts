import type { PublishingMediaFetchGrant } from "@/lib/clipstitchr/publishing/media/PublishingMediaFetchGrant";
import type { PublishingMediaUrlSignRequest } from "@/lib/clipstitchr/publishing/media/PublishingMediaUrlSignRequest";

export type PublishingMediaUrlSigner = {
  sign: (
    request: PublishingMediaUrlSignRequest,
  ) => Promise<PublishingMediaFetchGrant>;
};
