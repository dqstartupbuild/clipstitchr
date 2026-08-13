import { StudioBetaMediaFrame } from "@/app/_components/studio/StudioBetaMediaFrame";
import type { StudioBetaWorkspaceMediaCard } from "@/lib/clipstitchr/types/StudioBetaWorkspaceMediaCard";
import styles from "@/app/dashboard/studio/studioBetaWorkspace.module.css";

type StudioBetaContactSheetProps = {
  media: StudioBetaWorkspaceMediaCard[];
  posterUrlsByKey: Record<string, string>;
};

export function StudioBetaContactSheet({
  media,
  posterUrlsByKey,
}: StudioBetaContactSheetProps) {
  return (
    <section aria-labelledby="studio-contact-sheet" className={styles.contactSheet}>
      <div className={styles.sectionHeading}>
        <h2 id="studio-contact-sheet">Latest frames</h2>
        <p>{media.length} pieces on the table</p>
      </div>
      <div className={styles.filmStrip}>
        {media.map((item) => (
          <StudioBetaMediaFrame
            key={`${item.kind}:${item.id}`}
            media={item}
            posterUrl={
              item.posterObject
                ? posterUrlsByKey[item.posterObject.key]
                : undefined
            }
          />
        ))}
      </div>
    </section>
  );
}
