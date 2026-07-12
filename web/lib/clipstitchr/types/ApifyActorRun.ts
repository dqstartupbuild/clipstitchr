export type ApifyActorRun = {
  defaultDatasetId?: string;
  finishedAt?: string;
  id: string;
  startedAt?: string;
  status:
    | "READY"
    | "RUNNING"
    | "SUCCEEDED"
    | "FAILED"
    | "TIMING-OUT"
    | "TIMED-OUT"
    | "ABORTING"
    | "ABORTED";
};
