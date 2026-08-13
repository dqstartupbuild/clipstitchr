export type StudioClipsWorkerRuntimePreflight = {
  optionalFeatures: {
    broll: {
      missingEnvironment: string[];
      state: "available" | "unavailable";
    };
  };
  required: {
    invalidEnvironment: string[];
    missingEnvironment: string[];
    state: "available" | "unavailable";
  };
};
