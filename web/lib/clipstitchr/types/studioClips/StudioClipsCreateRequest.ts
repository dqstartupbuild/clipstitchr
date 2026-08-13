import type { StudioClipsSource } from "./StudioClipsSource";
import type { StudioClipsTaskOptions } from "./StudioClipsTaskOptions";

export type StudioClipsCreateRequest = {
  idempotencyKey: string;
  options: StudioClipsTaskOptions;
  productId: string;
  schemaVersion: "studio-clips-create-v1";
  source: StudioClipsSource;
};
