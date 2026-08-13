import type { FormEvent } from "react";

export async function createStudioEditorLibraryProject(
  event: FormEvent<HTMLFormElement>,
  name: string,
  createProject: (name: string) => Promise<string>,
  onOpen: (projectId: string) => void,
) {
  event.preventDefault();

  try {
    onOpen(await createProject(name));
  } catch {
    // The project hook owns the nearby user-facing error.
  }
}
