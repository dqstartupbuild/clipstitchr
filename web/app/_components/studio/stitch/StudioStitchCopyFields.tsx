import type { StudioStitchRecipeDraft } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchRecipeDraft";
import type { StudioStitchCreativeBriefOption } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchCreativeBriefOption";
import styles from "@/app/dashboard/studio/stitch/studioStitch.module.css";

export function StudioStitchCopyFields({
  brief,
  draft,
  onChange,
}: {
  brief: StudioStitchCreativeBriefOption;
  draft: StudioStitchRecipeDraft;
  onChange: (patch: Partial<StudioStitchRecipeDraft>) => void;
}) {
  return (
    <details className={styles.copyDetails}>
      <summary>Adjust Product-grounded copy</summary>
      <div className={styles.copyFields}>
        <label className={styles.field}>
          Hook
          <textarea
            maxLength={500}
            onChange={(event) => onChange({ hookText: event.target.value })}
            placeholder={brief.brief.hook}
            rows={3}
            value={draft.hookText}
          />
          <small>Blank keeps the selected brief&apos;s hook.</small>
        </label>
        {draft.pipeline === "classicReel" ? (
          <label className={styles.field}>
            Supporting overlay
            <textarea
              maxLength={500}
              onChange={(event) => onChange({ supportingText: event.target.value })}
              placeholder={brief.brief.soundOffOverlay}
              rows={3}
              value={draft.supportingText}
            />
          </label>
        ) : null}
        <label className={styles.field}>
          Call to action
          <textarea
            maxLength={500}
            onChange={(event) => onChange({ ctaText: event.target.value })}
            placeholder={brief.brief.closingCta ?? brief.brief.callToAction}
            rows={3}
            value={draft.ctaText}
          />
          <small>Keep claims inside the saved Product and approved brief.</small>
        </label>
      </div>
    </details>
  );
}
