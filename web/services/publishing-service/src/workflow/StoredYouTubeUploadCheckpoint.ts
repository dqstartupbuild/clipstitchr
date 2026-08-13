export type StoredYouTubeUploadCheckpoint = Readonly<{
  schemaVersion: 1;
  stage: "youtube-upload";
  sessionUri: string;
  totalBytes: number;
  committedOffset: number;
  videoId: string | null;
  thumbnailState:
    | "not-requested"
    | "pending"
    | "complete"
    | "outcome-unknown";
}>;
