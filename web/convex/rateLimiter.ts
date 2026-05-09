import { DAY, HOUR, MINUTE, RateLimiter } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

const GIGABYTE = 1024 * 1024 * 1024;

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  r2UploadUrl: {
    kind: "token bucket",
    rate: 100,
    period: HOUR,
    capacity: 30,
  },
  r2UploadBytes: {
    kind: "token bucket",
    rate: 2 * GIGABYTE,
    period: DAY,
    capacity: 2 * GIGABYTE,
  },
  r2DownloadUrl: {
    kind: "token bucket",
    rate: 120,
    period: HOUR,
    capacity: 30,
  },
  r2DeleteObjects: {
    kind: "token bucket",
    rate: 100,
    period: HOUR,
    capacity: 25,
  },
  replicateUploadAnalysis: {
    kind: "token bucket",
    rate: 100,
    period: HOUR,
    capacity: 30,
  },
  replicateUploadAnalysisGlobal: {
    kind: "token bucket",
    rate: 600,
    period: HOUR,
    capacity: 100,
    shards: 10,
  },
  replicateSwaprPhotoExpand: {
    kind: "token bucket",
    rate: 5,
    period: HOUR,
    capacity: 2,
  },
  replicateSwaprPhotoExpandGlobal: {
    kind: "token bucket",
    rate: 60,
    period: HOUR,
    capacity: 10,
    shards: 5,
  },
  replicateSwaprJobCreate: {
    kind: "token bucket",
    rate: 3,
    period: HOUR,
    capacity: 2,
  },
  replicateSwaprJobCreateDaily: {
    kind: "token bucket",
    rate: 10,
    period: DAY,
    capacity: 10,
  },
  replicateSwaprJobCreateGlobal: {
    kind: "token bucket",
    rate: 30,
    period: HOUR,
    capacity: 10,
    shards: 5,
  },
  replicateSwaprJobPoll: {
    kind: "token bucket",
    rate: 120,
    period: MINUTE,
    capacity: 30,
  },
  replicateSwaprJobCancel: {
    kind: "token bucket",
    rate: 30,
    period: HOUR,
    capacity: 5,
  },
  replicateSwaprOutputDownload: {
    kind: "token bucket",
    rate: 30,
    period: HOUR,
    capacity: 10,
  },
  replicateAvatarPhotoGenerate: {
    kind: "token bucket",
    rate: 20,
    period: HOUR,
    capacity: 10,
  },
  replicateAvatarPhotoGenerateDaily: {
    kind: "token bucket",
    rate: 30,
    period: DAY,
    capacity: 30,
  },
  replicateAvatarPhotoGenerateGlobal: {
    kind: "token bucket",
    rate: 200,
    period: HOUR,
    capacity: 40,
    shards: 10,
  },
  convexRecordSave: {
    kind: "token bucket",
    rate: 30,
    period: HOUR,
    capacity: 10,
  },
  convexMetadataUpdate: {
    kind: "token bucket",
    rate: 120,
    period: HOUR,
    capacity: 30,
  },
  convexPosterUpdate: {
    kind: "token bucket",
    rate: 60,
    period: HOUR,
    capacity: 15,
  },
  convexRecordDelete: {
    kind: "token bucket",
    rate: 100,
    period: HOUR,
    capacity: 20,
  },
});
