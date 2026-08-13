export type StudioStitchCtaPlan = {
  readonly text: string;
  readonly startSeconds: number;
  readonly endSeconds: number;
  readonly overlayId: string;
  readonly groundingClaimIds: readonly string[];
};
