"use client";

import { useState } from "react";
import { useReopenStudioStitchRecipe } from "@/lib/clipstitchr/hooks/studioStitch/useReopenStudioStitchRecipe";
import { useStudioStitchRecipes } from "@/lib/clipstitchr/hooks/studioStitch/useStudioStitchRecipes";
import { StudioStitchRecipeCard } from "./StudioStitchRecipeCard";
import { toggleStudioStitchRecipeSelection } from "./toggleStudioStitchRecipeSelection";
import styles from "@/app/dashboard/studio/stitch/studioStitch.module.css";

export function StudioStitchRecipeLibrary({
  productId,
  reloadSignal,
  selectedIds,
  onSelectedIdsChange,
  onCreateRun,
  isCreatingRun,
  runError,
}: {
  productId: string;
  reloadSignal: number;
  selectedIds: readonly string[];
  onSelectedIdsChange: (ids: string[]) => void;
  onCreateRun: (reviewCount: number) => void;
  isCreatingRun: boolean;
  runError: string | null;
}) {
  const [includeArchived, setIncludeArchived] = useState(false);
  const [reviewCount, setReviewCount] = useState(1);
  const state = useStudioStitchRecipes(
    productId,
    includeArchived,
    reloadSignal,
  );
  const reopen = useReopenStudioStitchRecipe(productId);
  const recipes = state.recipes ?? [];
  const boundedReviewCount = Math.min(reviewCount, selectedIds.length || 1);

  return (
    <section className={styles.recipeLibrary} aria-labelledby="saved-recipes-title">
      <header className={styles.libraryHeading}>
        <div>
          <h2 id="saved-recipes-title">Saved recipes</h2>
          <p>Choose up to 100 active recipes. The first run processes a small review sample.</p>
        </div>
        <label>
          <input checked={includeArchived} onChange={(event) => setIncludeArchived(event.target.checked)} type="checkbox" />
          Show archived
        </label>
      </header>
      {state.error ? (
        <div className={styles.inlineError} role="alert"><p>{state.error}</p><button onClick={state.reload} type="button">Try again</button></div>
      ) : state.isLoading ? (
        <p className={styles.loadingLine} role="status">Loading saved recipes...</p>
      ) : recipes.length === 0 ? (
        <p className={styles.emptyLibrary}>Save your first recipe above. Nothing is generated until you create a sample run.</p>
      ) : (
        <ol className={styles.recipeList}>
          {recipes.map((recipe) => (
            <StudioStitchRecipeCard
              key={`${recipe.id}-${recipe.revision}`}
              disabled={!selectedIds.includes(recipe.id) && selectedIds.length >= 100}
              isReopening={reopen.busyId === recipe.id}
              onReopen={() => void reopen.reopen(recipe).then((result) => { if (result) state.reload(); })}
              onToggle={() => toggleStudioStitchRecipeSelection(recipe, selectedIds, onSelectedIdsChange)}
              recipe={recipe}
              selected={selectedIds.includes(recipe.id)}
            />
          ))}
        </ol>
      )}
      {reopen.error ? <p className={styles.formError} role="alert">{reopen.error}</p> : null}
      <div className={styles.batchBar}>
        <div>
          <strong>{selectedIds.length} selected</strong>
          <span>Sample review first, remaining batch only after approval.</span>
        </div>
        <label>
          Review sample
          <input
            disabled={selectedIds.length === 0}
            max={Math.max(1, selectedIds.length)}
            min={1}
            onChange={(event) => setReviewCount(Number(event.target.value))}
            type="number"
            value={boundedReviewCount}
          />
        </label>
        <button
          disabled={selectedIds.length === 0 || isCreatingRun}
          onClick={() => onCreateRun(boundedReviewCount)}
          type="button"
        >
          {isCreatingRun ? "Creating sample run..." : "Create sample run"}
        </button>
      </div>
      {runError ? <p className={styles.formError} role="alert">{runError}</p> : null}
    </section>
  );
}
