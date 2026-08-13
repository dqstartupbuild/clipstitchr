import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";

export type StudioStitchOutput = FunctionReturnType<
  typeof api.studioReelOutputs.list.list
>[number];
