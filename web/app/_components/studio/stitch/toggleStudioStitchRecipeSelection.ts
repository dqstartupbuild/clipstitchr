import type { StudioStitchRecipeRecord } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchRecipeRecord";

export function toggleStudioStitchRecipeSelection(
  recipe: StudioStitchRecipeRecord,
  selectedIds: readonly string[],
  onSelectedIdsChange: (ids: string[]) => void,
) {
  onSelectedIdsChange(
    selectedIds.includes(recipe.id)
      ? selectedIds.filter((id) => id !== recipe.id)
      : [...selectedIds, recipe.id].slice(0, 100),
  );
}
