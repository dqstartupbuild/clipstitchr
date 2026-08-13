export type StudioClipsS3Sender = {
  send: (command: unknown) => Promise<Record<string, unknown>>;
};
