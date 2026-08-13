export type StudioClipsSource =
  | {
      kind: "youtube";
      url: string;
    }
  | {
      contentType: string;
      kind: "r2";
      objectKey: string;
      sizeBytes: number;
    };
