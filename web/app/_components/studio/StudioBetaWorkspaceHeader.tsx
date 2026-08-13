import Link from "next/link";
import { StudioBetaWorkspaceNavigation } from "@/app/_components/studio/StudioBetaWorkspaceNavigation";
import styles from "@/app/dashboard/studio/studioBetaWorkspace.module.css";

type StudioBetaWorkspaceHeaderProps = {
  productName: string;
};

export function StudioBetaWorkspaceHeader({
  productName,
}: StudioBetaWorkspaceHeaderProps) {
  return (
    <header className={styles.workspaceHeader}>
      <div className={styles.workspaceTitleBlock}>
        <p className={styles.productName}>{productName}</p>
        <h1>Studio cut room</h1>
      </div>
      <div className={styles.workspaceHeaderActions}>
        <p>
          A private workspace for shaping research, source clips, and finished
          cuts without changing your current tools.
        </p>
        <Link href="/dashboard/library" className={styles.primaryAction}>
          Open source library
        </Link>
      </div>
      <StudioBetaWorkspaceNavigation current="cut-room" />
    </header>
  );
}
