export type StudioClipsClaimSource =
  | {
      kind: "youtube";
      url: string;
    }
  | {
      kind: "r2";
      contentType: string;
      objectKey: string;
      sizeBytes: number;
    };
