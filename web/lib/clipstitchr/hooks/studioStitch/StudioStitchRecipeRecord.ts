import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";

export type StudioStitchRecipeRecord = FunctionReturnType<
  typeof api.studioReelRecipes.list.list
>[number];
