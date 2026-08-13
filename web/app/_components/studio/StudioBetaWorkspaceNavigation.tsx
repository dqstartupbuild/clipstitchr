import Link from "next/link";
import styles from "@/app/dashboard/studio/studioBetaWorkspace.module.css";

type StudioBetaWorkspaceNavigationProps = {
  current:
    | "clips"
    | "cut-room"
    | "edit"
    | "publishing"
    | "research"
    | "stitch";
};

export function StudioBetaWorkspaceNavigation({
  current,
}: StudioBetaWorkspaceNavigationProps) {
  return (
    <nav aria-label="Studio workspace" className={styles.workspaceNavigation}>
      {current === "cut-room" ? (
        <span aria-current="page" className={styles.currentWorkspace}>
          Cut room
        </span>
      ) : (
        <Link href="/dashboard/studio" className={styles.workspaceLink}>
          Cut room
        </Link>
      )}
      {current === "research" ? (
        <span aria-current="page" className={styles.currentWorkspace}>
          Research
        </span>
      ) : (
        <Link href="/dashboard/studio/research" className={styles.workspaceLink}>
          Research
        </Link>
      )}
      {current === "clips" ? (
        <span aria-current="page" className={styles.currentWorkspace}>
          Clips
        </span>
      ) : (
        <Link href="/dashboard/studio/clips" className={styles.workspaceLink}>
          Clips
        </Link>
      )}
      {current === "stitch" ? (
        <span aria-current="page" className={styles.currentWorkspace}>
          Stitch
        </span>
      ) : (
        <Link href="/dashboard/studio/stitch" className={styles.workspaceLink}>
          Stitch
        </Link>
      )}
      {current === "edit" ? (
        <span aria-current="page" className={styles.currentWorkspace}>
          Edit
        </span>
      ) : (
        <Link href="/dashboard/studio/edit" className={styles.workspaceLink}>
          Edit
        </Link>
      )}
      {current === "publishing" ? (
        <span aria-current="page" className={styles.currentWorkspace}>
          Publish
        </span>
      ) : (
        <Link
          href="/dashboard/studio/publishing"
          className={styles.workspaceLink}
        >
          Publish
        </Link>
      )}
      <Link href="/dashboard/library" className={styles.workspaceLink}>
        Source library
      </Link>
    </nav>
  );
}
