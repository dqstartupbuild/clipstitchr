export type YouTubeUploadProgress =
  | Readonly<{ kind: "active"; committedOffset: number }>
  | Readonly<{ kind: "complete"; videoId: string }>
  | Readonly<{ kind: "expired" }>;
