export type StudioClipsExecutionAvailability =
  | {
      state: "available";
    }
  | {
      message: string;
      reasonCode: "worker_adapter_not_configured";
      state: "unavailable";
    };
