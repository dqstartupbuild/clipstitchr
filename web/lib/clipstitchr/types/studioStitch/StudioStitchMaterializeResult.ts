export type StudioStitchMaterializeResult = {
  readonly created: boolean;
  readonly outputId: string;
  readonly libraryAsset: {
    readonly kind: "videoClip";
    readonly id: string;
  };
  readonly editorSource: {
    readonly kind: "studioOutput";
    readonly outputId: string;
  };
  readonly publishingSource: {
    readonly kind: "studio-stitch-output";
    readonly sourceId: string;
  };
};
