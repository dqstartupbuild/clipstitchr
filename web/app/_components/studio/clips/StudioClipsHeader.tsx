import { StudioBetaWorkspaceNavigation } from "@/app/_components/studio/StudioBetaWorkspaceNavigation";
import type { StudioClipsCapabilities } from "@/lib/clipstitchr/hooks/studioClips/StudioClipsCapabilities";
import styles from "@/app/dashboard/studio/clips/studioClips.module.css";

type StudioClipsHeaderProps = {
  capabilities: StudioClipsCapabilities | null;
  productName: string;
};

export function StudioClipsHeader({
  capabilities,
  productName,
}: StudioClipsHeaderProps) {
  const executionAvailable = capabilities?.execution.state === "available";

  return (
    <header className={styles.header}>
      <div className={styles.headerTitle}>
        <p className={styles.productName}>{productName}</p>
        <h1>Clip bench</h1>
      </div>
      <div className={styles.headerManifest}>
        <p>
          Bring one long video. Keep the strongest moments, the evidence behind
          each pick, and every handoff tied to this Product.
        </p>
        <dl>
          <div>
            <dt>Processing</dt>
            <dd>{executionAvailable ? "Ready" : "Unavailable"}</dd>
          </div>
          <div>
            <dt>YouTube</dt>
            <dd>{capabilities?.sources.youtube.state === "available" ? "Ready" : "Unavailable"}</dd>
          </div>
          <div>
            <dt>Local upload</dt>
            <dd>{capabilities?.sources.upload.state === "available" ? "Ready" : "Unavailable"}</dd>
          </div>
        </dl>
      </div>
      <StudioBetaWorkspaceNavigation current="clips" />
    </header>
  );
}
