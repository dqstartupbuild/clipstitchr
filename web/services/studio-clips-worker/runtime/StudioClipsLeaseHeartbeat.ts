import type { StudioClipsCheckpoint } from "../contracts/StudioClipsCheckpoint";
import type { StudioClipsProgressCode } from "../contracts/StudioClipsProgressCode";

export type StudioClipsLeaseHeartbeat = {
  run: <Result>(input: {
    checkpoint: StudioClipsCheckpoint;
    code: StudioClipsProgressCode;
    operation: () => Promise<Result>;
  }) => Promise<Result>;
};
