import { v } from "convex/values";

export const studioEditorWriteOperationValidator = v.union(
  v.literal("create"),
  v.literal("autosave"),
  v.literal("archive"),
  v.literal("reopen"),
);
