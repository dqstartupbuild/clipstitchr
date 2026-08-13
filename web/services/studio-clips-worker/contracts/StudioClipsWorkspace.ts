export type StudioClipsWorkspace = {
  assertWithinBudget: () => Promise<void>;
  maxBytes: number;
  path: string;
};
