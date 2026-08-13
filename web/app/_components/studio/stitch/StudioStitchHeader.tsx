import { StudioBetaWorkspaceNavigation } from "@/app/_components/studio/StudioBetaWorkspaceNavigation";
import styles from "@/app/dashboard/studio/stitch/studioStitch.module.css";

export function StudioStitchHeader({ productName }: { productName: string }) {
  return (
    <header className={styles.header}>
      <div className={styles.titleBlock}>
        <h1>
          <span>Shape the cut.</span>
          <span>Keep the proof.</span>
        </h1>
        <p className={styles.productName}>Cut room for {productName}</p>
      </div>
      <div className={styles.headerNote}>
        <p>
          Turn approved direction and owned footage into a saved recipe. Review
          a small sample before you ask for the rest of the batch.
        </p>
        <dl>
          <div>
            <dt>Classic</dt>
            <dd>7-15 seconds</dd>
          </div>
          <div>
            <dt>Talking</dt>
            <dd>20-30 seconds</dd>
          </div>
          <div>
            <dt>Processing</dt>
            <dd>Setup checked</dd>
          </div>
        </dl>
      </div>
      <StudioBetaWorkspaceNavigation current="stitch" />
    </header>
  );
}
