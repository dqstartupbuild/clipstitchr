import type { SwipePublishingBundle } from "@/lib/clipstitchr/publishing/media/SwipePublishingBundle";

export type GetSwipePublishingUploadAttempt = (input: {
  attemptId: string;
}) => Promise<{
  bundle: SwipePublishingBundle;
  status: "reserved" | "committed";
} | null>;
