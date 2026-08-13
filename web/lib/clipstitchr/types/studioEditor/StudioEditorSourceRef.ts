export type StudioEditorSourceRef =
  | { kind: "videoClip"; videoClipId: string }
  | { kind: "stitch"; stitchId: string }
  | { kind: "studioOutput"; outputId: string }
  | { kind: "studioUpload"; objectKey: string };
