import styles from "@/app/dashboard/studio/studioBetaWorkspace.module.css";

export function StudioBetaNoProduct() {
  return (
    <section className={styles.noProductState} role="status">
      <h2>Choose a Product first</h2>
      <p>
        Use the dashboard Product switcher to choose which sources, cuts, and
        finished videos belong in this workspace.
      </p>
    </section>
  );
}
