import { STUDIO_CLIPS_LIMITS } from "../constants/studioClipsLimits";
import { STUDIO_CLIPS_INPUT_CONTENT_TYPES } from "../constants/studioClipsMediaTypes";
import type { StudioClipsRenderArtifact } from "../contracts/StudioClipsRenderArtifact";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";
import { assertStudioClipsExactKeys } from "./assertStudioClipsExactKeys";
import { assertStudioClipsLocalArtifactFields } from "./assertStudioClipsLocalArtifactFields";
import { getStudioClipsValueIsRecord } from "./getStudioClipsValueIsRecord";
import { assertStudioClipsCleanMasterArtifact } from "./assertStudioClipsCleanMasterArtifact";

export function assertStudioClipsRenderArtifacts(
  value: unknown,
  workspacePath: string,
): asserts value is StudioClipsRenderArtifact[] {
  if (
    !Array.isArray(value) ||
    value.length < 1 ||
    value.length > STUDIO_CLIPS_LIMITS.artifactCount
  ) {
    throw new StudioClipsWorkerError({
      code: "INVALID_RENDER_OUTPUT",
      kind: "permanent",
      publicMessage: "The rendered clips could not be validated.",
    });
  }

  const identifiers = new Set<string>();

  for (const item of value) {
    if (!getStudioClipsValueIsRecord(item)) {
      throw new StudioClipsWorkerError({
        code: "INVALID_RENDER_OUTPUT",
        kind: "permanent",
        publicMessage: "The rendered clips could not be validated.",
      });
    }

    assertStudioClipsExactKeys(
      item,
      ["artifactId", "cleanMaster", "contentType", "fileName", "localPath", "sizeBytes", "sourceOutputId"],
      "Rendered clip",
    );
    assertStudioClipsLocalArtifactFields(item, {
      allowedContentTypes: STUDIO_CLIPS_INPUT_CONTENT_TYPES,
      label: "Rendered clip",
      maximumSizeBytes: STUDIO_CLIPS_LIMITS.outputSizeBytes,
      workspacePath,
    });

    if (
      typeof item.fileName !== "string" ||
      item.fileName.length < 1 ||
      item.fileName.length > 200 ||
      item.fileName.includes("/") ||
      item.fileName.includes("\\") ||
      /[\u0000-\u001f\u007f]/.test(item.fileName) ||
      (item.sourceOutputId !== undefined &&
        (typeof item.sourceOutputId !== "string" ||
          !/^[A-Za-z0-9:_-]{1,200}$/u.test(item.sourceOutputId))) ||
      identifiers.has(item.artifactId as string)
    ) {
      throw new StudioClipsWorkerError({
        code: "INVALID_RENDER_OUTPUT",
        kind: "permanent",
        publicMessage: "The rendered clips could not be validated.",
      });
    }

    identifiers.add(item.artifactId as string);
    if (item.cleanMaster !== undefined) {
      assertStudioClipsCleanMasterArtifact(item.cleanMaster, workspacePath);
    }
  }
}
