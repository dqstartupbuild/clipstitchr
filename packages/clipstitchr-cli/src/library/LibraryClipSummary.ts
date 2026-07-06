import type { ClipLibraryKind } from "./ClipLibraryKind.js";

export type LibraryClipSummary = {
  createdAt: string;
  duration: number;
  id: string;
  isPosted?: boolean;
  kind: ClipLibraryKind;
  name: string;
  productId?: string;
  updatedAt: string;
};
