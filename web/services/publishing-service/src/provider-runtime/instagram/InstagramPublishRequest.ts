import type { InstagramMedia } from "./InstagramMedia.js";

export type InstagramPublishRequest = Readonly<{
  attemptKey: string;
  accountId: string;
  accessToken: string;
  caption: string;
  placement: "feed" | "reel" | "story";
  media: readonly InstagramMedia[];
}>;
