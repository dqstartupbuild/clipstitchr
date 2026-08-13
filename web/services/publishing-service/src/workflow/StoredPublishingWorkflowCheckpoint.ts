import type { StoredInstagramPublishCheckpoint } from "./StoredInstagramPublishCheckpoint.js";
import type { StoredProviderPublishResult } from "./StoredProviderPublishResult.js";
import type { StoredYouTubeUploadCheckpoint } from "./StoredYouTubeUploadCheckpoint.js";

export type StoredPublishingWorkflowCheckpoint =
  | Readonly<{
      schemaVersion: 1;
      stage: "youtube-ready";
      totalBytes: number;
    }>
  | Readonly<{
      schemaVersion: 1;
      stage: "youtube-session-intent";
      operationId: string;
      totalBytes: number;
    }>
  | StoredYouTubeUploadCheckpoint
  | Readonly<{
      schemaVersion: 1;
      stage: "instagram-ready";
      checkpoint: StoredInstagramPublishCheckpoint | null;
    }>
  | Readonly<{
      schemaVersion: 1;
      stage: "instagram-dispatch-intent";
      operationId: string;
      previousCheckpoint: StoredInstagramPublishCheckpoint | null;
    }>
  | Readonly<{
      schemaVersion: 1;
      stage: "instagram-progress";
      checkpoint: StoredInstagramPublishCheckpoint;
    }>
  | Readonly<{
      schemaVersion: 1;
      stage: "tiktok-ready";
    }>
  | Readonly<{
      schemaVersion: 1;
      stage: "tiktok-dispatch-intent";
      operationId: string;
    }>
  | Readonly<{
      schemaVersion: 1;
      stage: "tiktok-processing";
      publishId: string;
      pollCount: number;
      acceptedAtEpochMilliseconds: number;
    }>
  | Readonly<{
      schemaVersion: 1;
      stage: "terminal";
      result: StoredProviderPublishResult;
    }>;
