import type { PublishingPostStatus } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostStatus";

export type PublishingCreatePostResponse = {
  destinations: {
    integrationId: string;
    message: string | null;
    postId: string;
    status: PublishingPostStatus;
  }[];
  requestId: string;
};
