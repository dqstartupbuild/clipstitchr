import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";

export type StudioStitchReviewSubset = NonNullable<
  FunctionReturnType<typeof api.studioReelReviewSubsets.get.get>
>;
