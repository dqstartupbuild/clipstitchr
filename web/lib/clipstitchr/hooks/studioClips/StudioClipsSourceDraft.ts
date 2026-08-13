export type StudioClipsSourceDraft =
  | { kind: "youtube"; url: string }
  | { file: File | null; kind: "upload" };
