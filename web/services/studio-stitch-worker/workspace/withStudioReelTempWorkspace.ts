import { chmod, mkdir, mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { STUDIO_REEL_WORKER_LIMITS } from "../constants/studioReelWorkerLimits";
import type { StudioReelWorkerWorkspace } from "../contracts/StudioReelWorkerWorkspace";
import { StudioReelWorkerError } from "../errors/StudioReelWorkerError";
import { getStudioReelDirectorySizeBytes } from "./getStudioReelDirectorySizeBytes";

export async function withStudioReelTempWorkspace<Result>(
  operation: (workspace: StudioReelWorkerWorkspace) => Promise<Result>,
  options: { maxBytes?: number; rootPath?: string } = {},
) {
  const maxBytes = options.maxBytes ?? STUDIO_REEL_WORKER_LIMITS.workspaceBytes;
  if (
    !Number.isSafeInteger(maxBytes) ||
    maxBytes < 1 ||
    maxBytes > STUDIO_REEL_WORKER_LIMITS.workspaceBytes
  ) {
    throw new StudioReelWorkerError({
      code: "INVALID_WORKSPACE_POLICY",
      kind: "permanent",
      publicMessage: "The Studio Stitch workspace policy is invalid.",
    });
  }
  const requestedRoot = options.rootPath ?? tmpdir();
  await mkdir(requestedRoot, { mode: 0o700, recursive: true });
  const rootPath = await realpath(requestedRoot);
  const workspacePath = await mkdtemp(
    join(rootPath, "clipstitchr-studio-stitch-"),
  );
  try {
    await chmod(workspacePath, 0o700);
    return await operation({
      assertWithinBudget: async () => {
        await getStudioReelDirectorySizeBytes(workspacePath, maxBytes);
      },
      maxBytes,
      path: workspacePath,
    });
  } finally {
    await rm(workspacePath, {
      force: true,
      maxRetries: 3,
      recursive: true,
      retryDelay: 50,
    });
  }
}
