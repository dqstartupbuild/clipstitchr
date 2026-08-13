import type { ChangeEvent, RefObject } from "react";

export async function uploadStudioEditorMediaFile(
  event: ChangeEvent<HTMLInputElement>,
  audioKind: "music" | "voice",
  inputRef: RefObject<HTMLInputElement | null>,
  onUpload: (file: File, audioKind: "music" | "voice") => Promise<string>,
) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    await onUpload(file, audioKind);
    event.target.value = "";
  } catch {
    inputRef.current?.focus();
  }
}
