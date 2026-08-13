"use client";

import { useRef, useState } from "react";
import { uploadStudioEditorMediaFile } from "./uploadStudioEditorMediaFile";
import styles from "@/app/dashboard/studio/edit/studioEditor.module.css";

type StudioEditorMediaUploadProps = {
  disabled: boolean;
  error: string | null;
  isUploading: boolean;
  onUpload: (file: File, audioKind: "music" | "voice") => Promise<string>;
};

export function StudioEditorMediaUpload({
  disabled,
  error,
  isUploading,
  onUpload,
}: StudioEditorMediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [audioKind, setAudioKind] = useState<"music" | "voice">("music");

  return (
    <section className={styles.mediaUpload}>
      <div>
        <h3>Add your own file</h3>
        <p>Video, image, or audio uploads stay private with this Product and reopen with this project.</p>
      </div>
      <label>
        Audio files become
        <select
          disabled={disabled || isUploading}
          value={audioKind}
          onChange={(event) => setAudioKind(event.target.value as "music" | "voice")}
        >
          <option value="music">Music</option>
          <option value="voice">Voice</option>
        </select>
      </label>
      <input
        ref={inputRef}
        accept="video/*,image/jpeg,image/png,image/webp,audio/*"
        disabled={disabled || isUploading}
        type="file"
        onChange={(event) => void uploadStudioEditorMediaFile(event, audioKind, inputRef, onUpload)}
      />
      {error && <p className={styles.inlineError} role="alert">{error}</p>}
      {isUploading && <p className={styles.loadingMessage} role="status">Uploading this source...</p>}
    </section>
  );
}
