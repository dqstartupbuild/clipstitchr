"use client";

import { useState } from "react";
import { createStudioEditorLibraryProject } from "./createStudioEditorLibraryProject";
import { StudioEditorProjectCard } from "@/app/_components/studio/editor/StudioEditorProjectCard";
import { useCreateStudioEditorProject } from "@/lib/clipstitchr/hooks/studioEditor/useCreateStudioEditorProject";
import { useStudioEditorProjectList } from "@/lib/clipstitchr/hooks/studioEditor/useStudioEditorProjectList";
import { useStudioEditorProjectStatusActions } from "@/lib/clipstitchr/hooks/studioEditor/useStudioEditorProjectStatusActions";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorProjectLibraryProps = {
  onOpen: (projectId: string) => void;
  productId: string;
};

export function StudioEditorProjectLibrary({
  onOpen,
  productId,
}: StudioEditorProjectLibraryProps) {
  const [name, setName] = useState("New vertical cut");
  const [includeArchived, setIncludeArchived] = useState(false);
  const projects = useStudioEditorProjectList(productId, includeArchived);
  const createState = useCreateStudioEditorProject(productId);
  const statusActions = useStudioEditorProjectStatusActions(productId);

  return (
    <section className={styles.projectLibrary} aria-labelledby="editor-projects-title">
      <div className={styles.projectIntro}>
        <div>
          <h2 id="editor-projects-title">Your edits</h2>
          <p>Open an existing cut or start with a clean 9:16 timeline.</p>
        </div>
        <form className={styles.createProjectForm} onSubmit={(event) => void createStudioEditorLibraryProject(event, name, createState.createProject, onOpen)}>
          <label htmlFor="studio-project-name">Edit name</label>
          <div>
            <input
              id="studio-project-name"
              maxLength={200}
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <button disabled={createState.isCreating} type="submit">
              {createState.isCreating ? "Starting..." : "Start an edit"}
            </button>
          </div>
        </form>
      </div>
      {(createState.error || statusActions.error) && (
        <p className={styles.inlineError} role="alert">
          {createState.error ?? statusActions.error}
        </p>
      )}
      <label className={styles.archiveToggle}>
        <input
          checked={includeArchived}
          type="checkbox"
          onChange={(event) => setIncludeArchived(event.target.checked)}
        />
        Show archived edits
      </label>
      {projects === undefined ? (
        <p className={styles.loadingMessage}>Opening your edit shelf...</p>
      ) : projects.length === 0 ? (
        <div className={styles.emptyProjects}>
          <p>No saved edits yet. Name the first cut above.</p>
        </div>
      ) : (
        <div className={styles.projectGrid}>
          {projects.map((project) => (
            <StudioEditorProjectCard
              key={project.id}
              busy={statusActions.busyProjectId === project.id}
              project={project}
              onArchive={statusActions.archive}
              onOpen={onOpen}
              onReopen={statusActions.reopen}
            />
          ))}
        </div>
      )}
    </section>
  );
}
