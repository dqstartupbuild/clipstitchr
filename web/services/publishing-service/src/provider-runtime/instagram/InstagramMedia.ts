export type InstagramMedia = Readonly<{
  kind: "image" | "video";
  url: string;
  thumbnailOffsetMilliseconds?: number;
}>;
