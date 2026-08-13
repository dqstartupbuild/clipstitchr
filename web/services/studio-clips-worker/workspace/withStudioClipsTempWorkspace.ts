import { chmod, mkdir, mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { STUDIO_CLIPS_LIMITS } from "../constants/studioClipsLimits";
import type { StudioClipsWorkspace } from "../contracts/StudioClipsWorkspace";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";
import { getStudioClipsDirectorySizeBytes } from "./getStudioClipsDirectorySizeBytes";

export async function withStudioClipsTempWorkspace<Result>(
  operation: (workspace: StudioClipsWorkspace) => Promise<Result>,
  options: { maxBytes?: number; rootPath?: string } = {},
): Promise<Result> {
  const maxBytes = options.maxBytes ?? STUDIO_CLIPS_LIMITS.workspaceBytes;

  if (
    !Number.isInteger(maxBytes) ||
    maxBytes < 1 ||
    maxBytes > STUDIO_CLIPS_LIMITS.workspaceBytes
  ) {
    throw new StudioClipsWorkerError({
      code: "INVALID_WORKSPACE_POLICY",
      kind: "permanent",
      publicMessage: "The temporary workspace policy is invalid.",
    });
  }

  const requestedRoot = options.rootPath ?? tmpdir();
  await mkdir(requestedRoot, { mode: 0o700, recursive: true });
  const rootPath = await realpath(requestedRoot);
  const workspacePath = await mkdtemp(join(rootPath, "clipstitchr-studio-clips-"));

  try {
    await chmod(workspacePath, 0o700);
    const workspace: StudioClipsWorkspace = {
      assertWithinBudget: async () => {
        await getStudioClipsDirectorySizeBytes(workspacePath, maxBytes);
      },
      maxBytes,
      path: workspacePath,
    };

    return await operation(workspace);
  } finally {
    await rm(workspacePath, {
      force: true,
      maxRetries: 3,
      recursive: true,
      retryDelay: 50,
    });
  }
}
