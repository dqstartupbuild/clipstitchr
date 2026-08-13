export type PublishingMediaDescriptor = {
  kind:
    | "library-media"
    | "stitch"
    | "swipe"
    | "studio-clip-output"
    | "studio-stitch-output";
  recordId: string;
};
