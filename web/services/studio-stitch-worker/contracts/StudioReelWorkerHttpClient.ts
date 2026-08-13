export type StudioReelWorkerHttpClient = {
  readonly post: (
    path: string,
    body: Readonly<Record<string, unknown>>,
  ) => Promise<unknown>;
};
