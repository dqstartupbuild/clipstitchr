import type { StudioBetaR2ObjectKind } from "@/lib/clipstitchr/types/StudioBetaR2ObjectKind";

const GIGABYTE = 1024 * 1024 * 1024;
const MEGABYTE = 1024 * 1024;

const maxBytesByKind: Record<StudioBetaR2ObjectKind, number> = {
  caption: 10 * MEGABYTE,
  font: 10 * MEGABYTE,
  "media-output": 2 * GIGABYTE,
  "media-source": 2 * GIGABYTE,
  poster: 20 * MEGABYTE,
  project: 25 * MEGABYTE,
  "research-artifact": 25 * MEGABYTE,
};

export function getStudioBetaR2UploadMaxBytes(kind: StudioBetaR2ObjectKind) {
  return maxBytesByKind[kind];
}
