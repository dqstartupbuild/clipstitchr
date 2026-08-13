import type { StudioStitchRecipeDraft } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchRecipeDraft";
import type { StudioEditorMediaSourceDescriptor } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceDescriptor";
import { STUDIO_STITCH_CLASSIC_HOOK_FAMILIES } from "@/lib/clipstitchr/studio/stitch/studioStitchClassicHookFamilies";
import { StudioStitchSourceCheckboxList } from "./StudioStitchSourceCheckboxList";
import styles from "@/app/dashboard/studio/stitch/studioStitch.module.css";

const labels = {
  whenRelatable: "When this happens",
  pov: "Point of view",
  statistic: "Proof by number",
  question: "Direct question",
  confession: "Confession",
  nobodyTalksAbout: "Nobody talks about this",
  challenge: "Challenge",
  beforeAfter: "Before and after",
} as const;

export function StudioStitchClassicFields({
  draft,
  sources,
  onChange,
}: {
  draft: StudioStitchRecipeDraft;
  sources: readonly StudioEditorMediaSourceDescriptor[];
  onChange: (patch: Partial<StudioStitchRecipeDraft>) => void;
}) {
  return (
    <div className={styles.pipelineFields}>
      <div className={styles.fieldPair}>
        <label className={styles.field}>
          Hook family
          <select
            onChange={(event) =>
              onChange({ classicHookFamily: event.target.value as StudioStitchRecipeDraft["classicHookFamily"] })
            }
            value={draft.classicHookFamily}
          >
            {STUDIO_STITCH_CLASSIC_HOOK_FAMILIES.map((family) => (
              <option key={family} value={family}>{labels[family]}</option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          Duration
          <select
            onChange={(event) => onChange({ durationSeconds: Number(event.target.value) })}
            value={draft.durationSeconds}
          >
            {[7, 8, 9, 10, 11, 12, 13, 14, 15].map((duration) => (
              <option key={duration} value={duration}>{duration} seconds</option>
            ))}
          </select>
        </label>
      </div>
      <StudioStitchSourceCheckboxList
        help="Choose the opening face or response."
        label="Reaction source"
        maximum={1}
        onChange={(reactionSourceIds) => onChange({ reactionSourceIds })}
        selectedIds={draft.reactionSourceIds}
        sources={sources}
      />
      <StudioStitchSourceCheckboxList
        help="Choose the clearest owned product proof."
        label="Demo source"
        maximum={1}
        onChange={(demoSourceIds) => onChange({ demoSourceIds })}
        selectedIds={draft.demoSourceIds}
        sources={sources}
      />
      <StudioStitchSourceCheckboxList
        help="Optional detail shots. Their order follows your selection order."
        label="Cutaways"
        maximum={3}
        onChange={(cutawaySourceIds) => onChange({ cutawaySourceIds })}
        selectedIds={draft.cutawaySourceIds}
        sources={sources}
      />
    </div>
  );
}
