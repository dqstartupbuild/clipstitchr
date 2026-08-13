import type { FormEvent } from "react";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { StudioEditorMediaSourceDescriptor } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceDescriptor";
import type { StudioStitchCreativeBriefOption } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchCreativeBriefOption";
import type { StudioStitchRecipeDraft } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchRecipeDraft";
import { createStudioStitchRecipeRequest } from "@/lib/clipstitchr/hooks/studioStitch/createStudioStitchRecipeRequest";

export async function submitStudioStitchRecipe(
  event: FormEvent<HTMLFormElement>,
  productId: string,
  brief: StudioStitchCreativeBriefOption | undefined,
  draft: StudioStitchRecipeDraft,
  sources: readonly StudioEditorMediaSourceDescriptor[],
  musicTracks: readonly SharedMusicTrack[],
  createRecipe: (
    request: ReturnType<typeof createStudioStitchRecipeRequest>,
  ) => Promise<unknown>,
  onSaved: () => void,
) {
  event.preventDefault();
  if (!brief) {
    return;
  }

  try {
    await createRecipe(
      createStudioStitchRecipeRequest({
        productId,
        briefOption: brief,
        draft,
        sources,
        musicTracks,
      }),
    );
    onSaved();
  } catch {
    // The recipe hook owns the nearby recoverable error.
  }
}
