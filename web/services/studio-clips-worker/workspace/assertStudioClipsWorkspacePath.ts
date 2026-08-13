import { isAbsolute, relative, resolve } from "node:path";
import { STUDIO_CLIPS_LIMITS } from "../constants/studioClipsLimits";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";

export function assertStudioClipsWorkspacePath(
  workspacePath: string,
  candidatePath: string,
): void {
  let resolvedWorkspace: string;
  let resolvedCandidate: string;

  try {
    resolvedWorkspace = resolve(workspacePath);
    resolvedCandidate = resolve(candidatePath);
  } catch (cause) {
    throw new StudioClipsWorkerError({
      cause,
      code: "WORKSPACE_PATH_REJECTED",
      kind: "permanent",
      publicMessage: "A pipeline file was outside its temporary workspace.",
    });
  }

  const relativePath = relative(resolvedWorkspace, resolvedCandidate);

  if (
    !candidatePath ||
    candidatePath.length > STUDIO_CLIPS_LIMITS.localPathCharacters ||
    relativePath === "" ||
    relativePath.startsWith("..") ||
    isAbsolute(relativePath)
  ) {
    throw new StudioClipsWorkerError({
      code: "WORKSPACE_PATH_REJECTED",
      kind: "permanent",
      publicMessage: "A pipeline file was outside its temporary workspace.",
    });
  }
}
