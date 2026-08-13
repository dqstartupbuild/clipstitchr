export type StudioClipsFailure = {
  code: string;
  kind: "permanent" | "retryable";
  message: string;
};
