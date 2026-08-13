export type StudioReelWorkerRuntimeCheck = {
  readonly contractVersion: "studio-stitch-claim-v1";
  readonly enabled: boolean;
  readonly missingEnvironment: readonly string[];
  readonly providers: {
    readonly dansugc: boolean;
    readonly elevenlabs: boolean;
    readonly gemini: boolean;
    readonly render: true;
  };
  readonly ready: boolean;
  readonly requiredCommands: readonly string[];
};
