export type StudioReelWorkerRuntimeConfig = {
  readonly commands: {
    readonly ffmpegPath: string;
    readonly ffprobePath: string;
    readonly fontPath: string;
  };
  readonly coordinator: {
    readonly origin: string;
    readonly requestTimeoutMs: number;
    readonly secret: string;
  };
  readonly leaseSeconds: number;
  readonly pollIntervalMs: number;
  readonly providers: {
    readonly dansugcApiKey?: string;
    readonly dansugcDownloadHosts: readonly string[];
    readonly elevenLabsApiKey?: string;
    readonly geminiApiKey?: string;
  };
  readonly r2: {
    readonly accessKeyId: string;
    readonly accountId: string;
    readonly bucketName: string;
    readonly secretAccessKey: string;
  };
  readonly scratchRoot?: string;
  readonly workerId: string;
};
