export type StudioReelWorkerWorkspace = {
  readonly assertWithinBudget: () => Promise<void>;
  readonly maxBytes: number;
  readonly path: string;
};
