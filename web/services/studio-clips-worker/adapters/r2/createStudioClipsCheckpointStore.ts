import { basename, join } from "node:path";
import type { StudioClipsCheckpointStore } from "../../contracts/StudioClipsCheckpointStore";
import { getStudioClipsClaimWorkId } from "../../contracts/getStudioClipsClaimWorkId";
import type { StudioClipsPipelineState } from "../../contracts/StudioClipsPipelineState";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import type { StudioClipsCompletionEvidence } from "../../runtime/StudioClipsCompletionEvidence";
import type { StudioClipsLeaseHeartbeat } from "../../runtime/StudioClipsLeaseHeartbeat";
import type { StudioClipsWorkerHttpClient } from "../http/StudioClipsWorkerHttpClient";
import { getStudioClipsCheckpointPrefix } from "./getStudioClipsCheckpointPrefix";
import { persistStudioClipsCheckpointArtifact } from "./persistStudioClipsCheckpointArtifact";
import { readStudioClipsCheckpointDocument } from "./readStudioClipsCheckpointDocument";
import { readStudioClipsCheckpointPointer } from "./readStudioClipsCheckpointPointer";
import { readStudioClipsCompletionEvidenceSnapshot } from "./readStudioClipsCompletionEvidenceSnapshot";
import { replaceStudioClipsCheckpointArtifactPath } from "./replaceStudioClipsCheckpointArtifactPath";
import type { StudioClipsR2ObjectStore } from "./StudioClipsR2ObjectStore";
import {
  STUDIO_CLIPS_CHECKPOINT_FILE_TOKEN_PREFIX,
  STUDIO_CLIPS_MAXIMUM_CHECKPOINT_BYTES,
  type StudioClipsCheckpointFileReference,
} from "./studioClipsCheckpointFormat";
import { studioClipsPreviousCheckpointProgress } from "./studioClipsPreviousCheckpointProgress";

export function createStudioClipsCheckpointStore(input: {
  evidence: StudioClipsCompletionEvidence;
  heartbeat: StudioClipsLeaseHeartbeat;
  http: StudioClipsWorkerHttpClient;
  objects: StudioClipsR2ObjectStore;
  startingRevision: number;
}): StudioClipsCheckpointStore {
  let revision = input.startingRevision;
  const cachedFiles = new Map<string, StudioClipsCheckpointFileReference>();

  return {
    restore: async ({ claim, resume, workspace }) => {
      const prefix = getStudioClipsCheckpointPrefix(claim);
      const response = await input.http.post(
        "/api/studio/clips/worker/checkpoints/get",
        {
          attempt: claim.attempt,
          leaseId: claim.leaseId,
          ownerId: claim.ownerId,
          productId: claim.productId,
          revision: resume.revision,
          taskId: getStudioClipsClaimWorkId(claim),
        },
      );
      if (
        !response ||
        typeof response !== "object" ||
        Array.isArray(response)
      ) {
        throw new StudioClipsWorkerError({
          code: "CHECKPOINT_NOT_FOUND",
          kind: "permanent",
          publicMessage: "The Studio Clips resume snapshot was not found.",
        });
      }
      const record = response as Record<string, unknown>;
      if (
        record.checkpoint !== resume.checkpoint ||
        record.revision !== resume.revision ||
        typeof record.snapshotJson !== "string"
      ) {
        throw new StudioClipsWorkerError({
          code: "CHECKPOINT_REVISION_MISMATCH",
          kind: "permanent",
          publicMessage: "The Studio Clips resume revision did not match.",
        });
      }
      const pointer = readStudioClipsCheckpointPointer(
        record.snapshotJson,
        prefix,
      );
      const bytes = await input.heartbeat.run({
        checkpoint: resume.checkpoint,
        code: resume.checkpoint,
        operation: () =>
          input.objects.getBytes({
            key: pointer.key,
            maximumBytes: STUDIO_CLIPS_MAXIMUM_CHECKPOINT_BYTES,
            sha256Hex: pointer.sha256Hex,
            sizeBytes: pointer.sizeBytes,
          }),
      });
      const document = readStudioClipsCheckpointDocument(bytes);
      if (document.files.length > 205) {
        throw new StudioClipsWorkerError({
          code: "INVALID_CHECKPOINT_FILE",
          kind: "permanent",
          publicMessage: "The Studio Clips resume snapshot has too many files.",
        });
      }
      const state = structuredClone(document.state);
      const tokenPaths = new Map<string, string>();
      const fileIds = new Set<string>();

      for (const [index, candidate] of document.files.entries()) {
        if (
          !candidate ||
          typeof candidate !== "object" ||
          !/^[A-Za-z0-9:_-]{1,200}$/.test(candidate.id) ||
          fileIds.has(candidate.id) ||
          typeof candidate.key !== "string" ||
          !candidate.key.startsWith(`${prefix}/`) ||
          candidate.key.includes("..") ||
          candidate.key.includes("\\") ||
          candidate.key.includes("?") ||
          candidate.key.includes("#") ||
          typeof candidate.contentType !== "string" ||
          !/^[a-z0-9.+-]+\/[a-z0-9.+-]{1,100}$/.test(candidate.contentType) ||
          typeof candidate.fileName !== "string" ||
          basename(candidate.fileName) !== candidate.fileName ||
          candidate.fileName.length > 200 ||
          /[\u0000-\u001f\u007f]/.test(candidate.fileName) ||
          !/^[a-f0-9]{64}$/.test(candidate.sha256Hex) ||
          !Number.isInteger(candidate.sizeBytes) ||
          candidate.sizeBytes < 1 ||
          candidate.sizeBytes > workspace.maxBytes
        ) {
          throw new StudioClipsWorkerError({
            code: "INVALID_CHECKPOINT_FILE",
            kind: "permanent",
            publicMessage: "A Studio Clips resume file reference is invalid.",
          });
        }
        fileIds.add(candidate.id);
        const outputPath = join(
          workspace.path,
          `restored-${index}-${candidate.fileName}`,
        );
        const downloaded = await input.heartbeat.run({
          checkpoint: resume.checkpoint,
          code: resume.checkpoint,
          operation: () =>
            input.objects.downloadFile({
              contentType: candidate.contentType,
              key: candidate.key,
              maximumBytes: workspace.maxBytes,
              outputPath,
              sizeBytes: candidate.sizeBytes,
            }),
        });
        if (downloaded.sha256Hex !== candidate.sha256Hex) {
          throw new StudioClipsWorkerError({
            code: "CHECKPOINT_FILE_MISMATCH",
            kind: "permanent",
            publicMessage:
              "A Studio Clips resume file failed integrity checks.",
          });
        }
        tokenPaths.set(
          `${STUDIO_CLIPS_CHECKPOINT_FILE_TOKEN_PREFIX}${candidate.id}`,
          outputPath,
        );
        cachedFiles.set(outputPath, candidate);
      }

      replaceStudioClipsCheckpointArtifactPath(state.source, tokenPaths);
      if (Array.isArray(state.sources)) {
        state.sources.forEach((artifact) =>
          replaceStudioClipsCheckpointArtifactPath(artifact, tokenPaths),
        );
      }
      if (Array.isArray(state.broll)) {
        state.broll.forEach((artifact) =>
          replaceStudioClipsCheckpointArtifactPath(artifact, tokenPaths),
        );
      }
      if (Array.isArray(state.renders)) {
        state.renders.forEach((render) => {
          replaceStudioClipsCheckpointArtifactPath(render, tokenPaths);
          if (render && typeof render === "object" && !Array.isArray(render)) {
            replaceStudioClipsCheckpointArtifactPath(
              (render as Record<string, unknown>).cleanMaster,
              tokenPaths,
            );
          }
        });
      }

      input.evidence.restore(
        readStudioClipsCompletionEvidenceSnapshot(document.evidence),
      );
      revision = resume.revision;
      return state as StudioClipsPipelineState;
    },
    save: async ({ checkpoint, claim, state, workspace }) => {
      const nextRevision = revision + 1;
      const prefix = getStudioClipsCheckpointPrefix(claim);
      const portable = structuredClone(state) as Record<string, unknown>;
      const files: StudioClipsCheckpointFileReference[] = [];

      const artifactInput = {
        cachedFiles,
        fileKeyPrefix: `${prefix}/attempt-${claim.attempt}/files`,
        files,
        heartbeat: input.heartbeat,
        heartbeatProgress: studioClipsPreviousCheckpointProgress[checkpoint],
        maximumBytes: workspace.maxBytes,
        objects: input.objects,
      };
      await persistStudioClipsCheckpointArtifact({
        ...artifactInput,
        artifact: portable.source,
        fallbackName: "source",
        id: "source",
      });
      if (Array.isArray(portable.sources)) {
        for (const [index, artifact] of portable.sources.entries()) {
          await persistStudioClipsCheckpointArtifact({
            ...artifactInput,
            artifact,
            fallbackName: `source-${index + 1}`,
            id: `source:${index}`,
          });
        }
      }
      if (Array.isArray(portable.broll)) {
        for (const [index, artifact] of portable.broll.entries()) {
          await persistStudioClipsCheckpointArtifact({
            ...artifactInput,
            artifact,
            fallbackName: `broll-${index + 1}`,
            id: `broll:${index}`,
          });
        }
      }
      if (Array.isArray(portable.renders)) {
        for (const [index, artifact] of portable.renders.entries()) {
          await persistStudioClipsCheckpointArtifact({
            ...artifactInput,
            artifact,
            fallbackName: `render-${index + 1}`,
            id: `render:${index}`,
          });
          if (
            artifact &&
            typeof artifact === "object" &&
            !Array.isArray(artifact)
          ) {
            await persistStudioClipsCheckpointArtifact({
              ...artifactInput,
              artifact: (artifact as Record<string, unknown>).cleanMaster,
              fallbackName: `clean-master-${index + 1}`,
              id: `clean-master:${index}`,
            });
          }
        }
      }

      const document = new TextEncoder().encode(
        JSON.stringify({
          evidence: input.evidence.snapshot(),
          files,
          schemaVersion: "studio-clips-checkpoint-document-v1",
          state: portable,
        }),
      );
      if (document.byteLength > STUDIO_CLIPS_MAXIMUM_CHECKPOINT_BYTES) {
        throw new StudioClipsWorkerError({
          code: "CHECKPOINT_TOO_LARGE",
          kind: "permanent",
          publicMessage:
            "The Studio Clips resume snapshot exceeded its size limit.",
        });
      }
      const key = `${prefix}/attempt-${claim.attempt}/revisions/${nextRevision}.json`;
      const proof = await input.heartbeat.run({
        ...studioClipsPreviousCheckpointProgress[checkpoint],
        operation: () =>
          input.objects.putBytesVerified({
            body: document,
            contentType: "application/json",
            key,
          }),
      });
      const response = await input.http.post(
        "/api/studio/clips/worker/checkpoints/save",
        {
          attempt: claim.attempt,
          checkpoint,
          expectedRevision: revision,
          leaseId: claim.leaseId,
          ownerId: claim.ownerId,
          productId: claim.productId,
          snapshotJson: JSON.stringify({
            key,
            schemaVersion: "studio-clips-r2-checkpoint-v1",
            sha256Hex: proof.sha256Hex,
            sizeBytes: proof.sizeBytes,
          }),
          taskId: getStudioClipsClaimWorkId(claim),
        },
      );
      if (
        !response ||
        typeof response !== "object" ||
        Array.isArray(response) ||
        (response as Record<string, unknown>).checkpoint !== checkpoint ||
        (response as Record<string, unknown>).revision !== nextRevision
      ) {
        throw new StudioClipsWorkerError({
          code: "INVALID_CHECKPOINT_RESPONSE",
          kind: "retryable",
          publicMessage:
            "The Studio Clips resume revision could not be confirmed.",
        });
      }
      revision = nextRevision;
      return { revision };
    },
  };
}
