import type { StudioClipsCheckpoint } from "./StudioClipsCheckpoint";

export type StudioClipsCancellationGateway = {
  getIsCancellationRequested: (input: {
    checkpoint: StudioClipsCheckpoint;
    ownerId: string;
    productId: string;
    taskId: string;
  }) => Promise<boolean>;
};
