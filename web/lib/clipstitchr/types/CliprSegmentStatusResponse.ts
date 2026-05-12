import type { SwaprPredictionStatus } from "@/lib/clipstitchr/types/SwaprPredictionStatus";

export type CliprSegmentStatusResponse = {
  videoPredictionId: string;
  status: SwaprPredictionStatus;
  videoUrl?: string;
  error?: unknown;
  logs?: string;
  urls?: {
    get?: string;
    web?: string;
    cancel?: string;
  };
};
