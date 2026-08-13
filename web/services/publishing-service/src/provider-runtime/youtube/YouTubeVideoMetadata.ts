export type YouTubeVideoMetadata = Readonly<{
  title: string;
  description: string;
  visibility: "private" | "public" | "unlisted";
  madeForKids: boolean;
  tags: readonly string[];
}>;
