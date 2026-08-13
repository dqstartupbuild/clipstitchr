export type StudioClipsWorkerRuntimeConfig = {
  analysis: {
    apiKey: string;
    model: string;
    provider: "google" | "openai";
  };
  assemblyAi: {
    apiKey: string;
    pollIntervalMs: number;
    timeoutMs: number;
  };
  broll?: {
    apiKey: string;
  };
  commands: {
    builtInFontsDirectory: string;
    ffmpegPath: string;
    ffprobePath: string;
    ytDlpPath: string;
  };
  coordinator: {
    origin: string;
    requestTimeoutMs: number;
    secret: string;
  };
  leaseSeconds: number;
  pollIntervalMs: number;
  r2: {
    accessKeyId: string;
    accountId: string;
    bucketName: string;
    secretAccessKey: string;
  };
  scratchRoot?: string;
  workerId: string;
};
