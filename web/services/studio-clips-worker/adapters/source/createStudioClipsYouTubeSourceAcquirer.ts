import { stat } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { STUDIO_CLIPS_LIMITS } from "../../constants/studioClipsLimits";
import type { StudioClipsInitialClaimEnvelope } from "../../contracts/StudioClipsInitialClaimEnvelope";
import type { StudioClipsSourceArtifact } from "../../contracts/StudioClipsSourceArtifact";
import type { StudioClipsYouTubeNavigationPolicy } from "../../contracts/StudioClipsYouTubeNavigationPolicy";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import { assertStudioClipsWorkspacePath } from "../../workspace/assertStudioClipsWorkspacePath";
import type { StudioClipsCommandRunner } from "../process/StudioClipsCommandRunner";
import { getStudioClipsVideoContentType } from "../media/getStudioClipsVideoContentType";

export function createStudioClipsYouTubeSourceAcquirer(input: {
  runner: StudioClipsCommandRunner;
  ytDlpPath: string;
}) {
  return async (request: {
    claim: StudioClipsInitialClaimEnvelope;
    policy: StudioClipsYouTubeNavigationPolicy;
    workspacePath: string;
  }): Promise<StudioClipsSourceArtifact> => {
    if (request.claim.source.kind !== "youtube") {
      throw new StudioClipsWorkerError({
        code: "INVALID_SOURCE_KIND",
        kind: "permanent",
        publicMessage: "The Studio Clips source type is invalid.",
      });
    }
    const url = request.policy.readUrl(request.claim.source.url).toString();
    const result = await input.runner({
      args: [
        "--no-config",
        "--no-playlist",
        "--no-part",
        "--restrict-filenames",
        "--socket-timeout",
        "30",
        "--retries",
        "3",
        "--fragment-retries",
        "3",
        "--max-filesize",
        String(STUDIO_CLIPS_LIMITS.inputSizeBytes),
        "--match-filter",
        `duration <= ${STUDIO_CLIPS_LIMITS.inputDurationSeconds}`,
        "--format",
        "bestvideo*[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/bestvideo*+bestaudio/best",
        "--merge-output-format",
        "mp4",
        "--paths",
        request.workspacePath,
        "--output",
        "source.%(ext)s",
        "--print",
        "after_move:filepath",
        "--",
        url,
      ],
      command: input.ytDlpPath,
      cwd: request.workspacePath,
      maximumOutputBytes: 262_144,
      timeoutMs: 1_200_000,
    });
    const reportedPath = result.stdout.trim().split(/\r?\n/).filter(Boolean).at(-1);
    if (!reportedPath) {
      throw new StudioClipsWorkerError({
        code: "YOUTUBE_DOWNLOAD_MISSING",
        kind: "retryable",
        publicMessage: "YouTube did not return a downloaded video.",
      });
    }
    const localPath = isAbsolute(reportedPath)
      ? reportedPath
      : resolve(request.workspacePath, reportedPath);
    assertStudioClipsWorkspacePath(request.workspacePath, localPath);
    const file = await stat(localPath);
    if (!file.isFile() || file.size < 1 || file.size > STUDIO_CLIPS_LIMITS.inputSizeBytes) {
      throw new StudioClipsWorkerError({
        code: "YOUTUBE_DOWNLOAD_INVALID",
        kind: "permanent",
        publicMessage: "The downloaded YouTube video exceeded supported limits.",
      });
    }
    return {
      contentType: getStudioClipsVideoContentType(localPath),
      localPath,
      sizeBytes: file.size,
    };
  };
}
