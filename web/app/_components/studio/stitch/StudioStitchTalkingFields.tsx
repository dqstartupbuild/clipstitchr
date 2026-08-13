import type { StudioStitchRecipeDraft } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchRecipeDraft";
import type { StudioEditorMediaSourceDescriptor } from "@/lib/clipstitchr/types/studioEditor/StudioEditorMediaSourceDescriptor";
import { STUDIO_STITCH_TALKING_HOOK_FAMILIES } from "@/lib/clipstitchr/studio/stitch/studioStitchTalkingHookFamilies";
import { StudioStitchSourceCheckboxList } from "./StudioStitchSourceCheckboxList";
import styles from "@/app/dashboard/studio/stitch/studioStitch.module.css";

const labels = {
  deception: "Expectation flip",
  identityDream: "Identity dream",
  socialProblem: "Social problem",
  genuineShock: "Genuine shock",
  whichIsReal: "Which one is real",
} as const;

export function StudioStitchTalkingFields({
  draft,
  sources,
  onChange,
}: {
  draft: StudioStitchRecipeDraft;
  sources: readonly StudioEditorMediaSourceDescriptor[];
  onChange: (patch: Partial<StudioStitchRecipeDraft>) => void;
}) {
  const wordCount = draft.voiceScript.trim().split(/\s+/).filter(Boolean).length;
  const minimum = Math.ceil(draft.durationSeconds * 2.5);
  const maximum = Math.floor(draft.durationSeconds * 2.75);
  return (
    <div className={styles.pipelineFields}>
      <div className={styles.fieldPair}>
        <label className={styles.field}>
          Hook family
          <select
            onChange={(event) =>
              onChange({ talkingHookFamily: event.target.value as StudioStitchRecipeDraft["talkingHookFamily"] })
            }
            value={draft.talkingHookFamily}
          >
            {STUDIO_STITCH_TALKING_HOOK_FAMILIES.map((family) => (
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
            {[20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((duration) => (
              <option key={duration} value={duration}>{duration} seconds</option>
            ))}
          </select>
        </label>
      </div>
      <label className={styles.field}>
        On-camera creator
        <input
          maxLength={240}
          onChange={(event) => onChange({ creatorContinuityKey: event.target.value })}
          placeholder="Creator A"
          value={draft.creatorContinuityKey}
        />
        <small>All five reaction beats must belong to this same creator.</small>
      </label>
      <StudioStitchSourceCheckboxList
        help="Select five beats in timeline order: hook, context, bridge, support, CTA."
        label="Reaction sequence"
        maximum={5}
        onChange={(reactionSourceIds) => onChange({ reactionSourceIds })}
        selectedIds={draft.reactionSourceIds}
        sources={sources}
      />
      <StudioStitchSourceCheckboxList
        help="Select setup first, then the strongest proof moment."
        label="Demo sequence"
        maximum={2}
        onChange={(demoSourceIds) => onChange({ demoSourceIds })}
        selectedIds={draft.demoSourceIds}
        sources={sources}
      />
      <label className={styles.field}>
        Voice script
        <textarea
          maxLength={8000}
          onChange={(event) => onChange({ voiceScript: event.target.value })}
          placeholder="Leave blank to use the selected brief's spoken lines."
          rows={7}
          value={draft.voiceScript}
        />
        <small>{wordCount} words entered. The {draft.durationSeconds}s target is {minimum}-{maximum} words.</small>
      </label>
      <div className={styles.fieldPair}>
        <label className={styles.field}>
          ElevenLabs voice ID
          <input maxLength={240} onChange={(event) => onChange({ voiceId: event.target.value })} value={draft.voiceId} />
        </label>
        <label className={styles.field}>
          Voice label
          <input maxLength={240} onChange={(event) => onChange({ voiceName: event.target.value })} value={draft.voiceName} />
        </label>
      </div>
      <label className={styles.field}>
        Emphasis words
        <input
          maxLength={1200}
          onChange={(event) => onChange({ emphasisWords: event.target.value })}
          placeholder="proof, result, today"
          value={draft.emphasisWords}
        />
        <small>Comma-separated. Voice timing drives captions, and stays pending until a configured provider supplies real word timings.</small>
      </label>
    </div>
  );
}
