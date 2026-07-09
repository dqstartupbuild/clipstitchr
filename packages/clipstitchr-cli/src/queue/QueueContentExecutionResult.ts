import type { QueueContentItem } from "./QueueContentItem.js";

export type QueueContentExecutionResult =
  | {
      item: QueueContentItem;
      postId: string;
      postStatus: string;
      queued: true;
    }
  | {
      item: QueueContentItem;
      message: string;
      queued: false;
    };
