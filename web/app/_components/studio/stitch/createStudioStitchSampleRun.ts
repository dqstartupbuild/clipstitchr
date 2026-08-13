import type { Dispatch, SetStateAction } from "react";

export async function createStudioStitchSampleRun(
  reviewCount: number,
  selectedRecipeIds: string[],
  createRun: (
    recipeIds: readonly string[],
    reviewCount: number,
  ) => Promise<{ run: { id: string } } | null>,
  remember: (id: string) => void,
  setSelectedRunId: Dispatch<SetStateAction<string | null>>,
  setSelectedRecipeIds: Dispatch<SetStateAction<string[]>>,
) {
  const result = await createRun(selectedRecipeIds, reviewCount);
  if (!result) {
    return;
  }

  remember(result.run.id);
  setSelectedRunId(result.run.id);
  setSelectedRecipeIds([]);
}
