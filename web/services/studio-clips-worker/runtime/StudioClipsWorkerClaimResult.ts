export type StudioClipsWorkerClaimResult =
  | {
      availability: unknown;
      state: "idle";
    }
  | {
      availability: unknown;
      taskId: string;
      state: "cancelled" | "completed" | "failed";
    };
