export type StudioReelGeminiAnalysis = {
  readonly selectedMoments: readonly {
    readonly endSeconds: number;
    readonly reason: string;
    readonly startSeconds: number;
  }[];
  readonly summary: string;
};
