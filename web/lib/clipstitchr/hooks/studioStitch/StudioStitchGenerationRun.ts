import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";

type StudioStitchGenerationRunQuery = FunctionReturnType<
  typeof api.studioReelGenerationRuns.get.get
>;

export type StudioStitchGenerationRun = NonNullable<
  StudioStitchGenerationRunQuery["run"]
>;
