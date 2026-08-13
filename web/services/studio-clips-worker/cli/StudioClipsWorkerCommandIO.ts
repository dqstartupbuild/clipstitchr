export type StudioClipsWorkerCommandIO = {
  stderr: (value: string) => void;
  stdout: (value: string) => void;
};
