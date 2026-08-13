"use client";

import { useMemo, useState } from "react";
import type { StudioEditorMediaSourceDescriptor } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceDescriptor";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";
import type { StudioStitchCreativeBriefOption } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchCreativeBriefOption";
import { createDefaultStudioStitchRecipeDraft } from "@/lib/clipstitchr/hooks/studioStitch/createDefaultStudioStitchRecipeDraft";
import { useCreateStudioStitchRecipe } from "@/lib/clipstitchr/hooks/studioStitch/useCreateStudioStitchRecipe";
import { StudioStitchBriefSourcePicker } from "./StudioStitchBriefSourcePicker";
import { StudioStitchClassicFields } from "./StudioStitchClassicFields";
import { StudioStitchCopyFields } from "./StudioStitchCopyFields";
import { StudioStitchMusicField } from "./StudioStitchMusicField";
import { StudioStitchPipelinePicker } from "./StudioStitchPipelinePicker";
import { StudioStitchTalkingFields } from "./StudioStitchTalkingFields";
import { submitStudioStitchRecipe } from "./submitStudioStitchRecipe";
import styles from "@/app/dashboard/studio/stitch/studioStitch.module.css";

export function StudioStitchRecipeBuilder({
  productId,
  briefOptions,
  sources,
  musicTracks,
  initialBriefId,
  initialSourceId,
  onSaved,
}: {
  productId: string;
  briefOptions: readonly StudioStitchCreativeBriefOption[];
  sources: readonly StudioEditorMediaSourceDescriptor[];
  musicTracks: readonly SharedMusicTrack[];
  initialBriefId?: string;
  initialSourceId?: string;
  onSaved: () => void;
}) {
  const [briefId, setBriefId] = useState(
    initialBriefId ?? briefOptions[0]?.id ?? "",
  );
  const [draft, setDraft] = useState(() =>
    createDefaultStudioStitchRecipeDraft(
      initialSourceId && sources.some((source) => source.id === initialSourceId)
        ? initialSourceId
        : undefined,
    ),
  );
  const create = useCreateStudioStitchRecipe();
  const brief = useMemo(
    () => briefOptions.find((option) => option.id === briefId) ?? briefOptions[0],
    [briefId, briefOptions],
  );
  if (!brief) return null;
  return (
    <form className={styles.recipeBuilder} onSubmit={(event) => void submitStudioStitchRecipe(event, productId, brief, draft, sources, musicTracks, create.createRecipe, onSaved)}>
      <header className={styles.sectionLead}>
        <h2>Build one recipe</h2>
        <p>
          Start with direction, then reveal only the inputs this cut needs. The
          saved recipe keeps a locked version you can return to.
        </p>
      </header>
      <StudioStitchBriefSourcePicker options={briefOptions} selectedId={brief.id} onSelect={setBriefId} />
      <StudioStitchPipelinePicker
        value={draft.pipeline}
        onChange={(pipeline) =>
          setDraft((current) => ({ ...current,
            pipeline,
            durationSeconds: pipeline === "classicReel" ? 15 : 30,
            reactionSourceIds: [],
            demoSourceIds: [],
            cutawaySourceIds: [],
          }))
        }
      />
      {draft.pipeline === "classicReel" ? (
        <StudioStitchClassicFields draft={draft} onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))} sources={sources} />
      ) : (
        <StudioStitchTalkingFields draft={draft} onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))} sources={sources} />
      )}
      <StudioStitchCopyFields brief={brief} draft={draft} onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))} />
      <StudioStitchMusicField draft={draft} onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))} tracks={musicTracks} />
      {create.error ? <p className={styles.formError} role="alert">{create.error}</p> : null}
      {create.statusMessage ? <p className={styles.formStatus} role="status">{create.statusMessage}</p> : null}
      <div className={styles.saveRecipeRow}>
        <p>Saving a recipe does not start processing.</p>
        <button disabled={create.isCreating || sources.length === 0} type="submit">
          {create.isCreating ? "Saving recipe..." : "Save recipe"}
        </button>
      </div>
    </form>
  );
}
