import type { StoredInstagramPublishCheckpoint } from "./StoredInstagramPublishCheckpoint.js";
import type { StoredProviderPublishResult } from "./StoredProviderPublishResult.js";

export type StoredPublishingWorkflowCheckpoint =
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
