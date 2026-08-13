import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";

export function replaceStudioClipsCheckpointArtifactPath(
  artifact: unknown,
  tokenPaths: ReadonlyMap<string, string>,
): void {
  if (!artifact || typeof artifact !== "object" || Array.isArray(artifact))
    return;
  const record = artifact as Record<string, unknown>;
  if (typeof record.localPath !== "string") return;
  const localPath = tokenPaths.get(record.localPath);
  if (!localPath) {
    throw new StudioClipsWorkerError({
      code: "CHECKPOINT_FILE_MISSING",
      kind: "permanent",
      publicMessage: "A Studio Clips resume file is missing.",
    });
  }
  record.localPath = localPath;
}
