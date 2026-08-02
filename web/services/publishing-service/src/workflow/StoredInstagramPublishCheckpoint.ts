export type StoredInstagramPublishCheckpoint = Readonly<{
  attemptKey: string;
  accountId: string;
  mediaCount: number;
  phase:
    | "create_child"
    | "create_child_dispatched"
    | "wait_child"
    | "create_parent"
    | "create_parent_dispatched"
    | "wait_parent"
    | "ready_to_publish"
    | "publish_dispatched"
    | "published";
  childContainerIds: readonly string[];
  nextMediaIndex: number;
  activeContainerId: string | null;
  parentContainerId: string | null;
  mediaId: string | null;
  permalink: string | null;
}>;
