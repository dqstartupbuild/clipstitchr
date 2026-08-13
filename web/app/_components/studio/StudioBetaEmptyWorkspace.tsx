import Link from "next/link";
import styles from "@/app/dashboard/studio/studioBetaWorkspace.module.css";

export function StudioBetaEmptyWorkspace() {
  return (
    <section className={styles.emptyWorkspace} aria-labelledby="empty-studio">
      <div aria-hidden className={styles.emptySpliceMark}>
        <span />
        <span />
      </div>
      <div>
        <h2 id="empty-studio">Your cut room is ready</h2>
        <p>
          Add a source clip to your Library. It will appear here when you come
          back.
        </p>
      </div>
      <Link href="/dashboard/library" className={styles.primaryAction}>
        Open source library
      </Link>
    </section>
  );
}
