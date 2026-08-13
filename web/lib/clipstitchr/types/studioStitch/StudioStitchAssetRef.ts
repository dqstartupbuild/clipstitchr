export type StudioStitchAssetRef =
  | { readonly kind: "videoClip"; readonly videoClipId: string }
  | { readonly kind: "stitch"; readonly stitchId: string }
  | { readonly kind: "studioOutput"; readonly outputId: string }
  | { readonly kind: "studioUpload"; readonly objectKey: string };
