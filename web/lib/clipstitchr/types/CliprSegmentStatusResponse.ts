import type { SwaprPredictionStatus } from "@/lib/clipstitchr/types/SwaprPredictionStatus";

export type CliprSegmentStatusResponse = {
  videoPredictionId: string;
  status: SwaprPredictionStatus;
  videoUrl?: string;
  error?: unknown;
  fallbackReason?: string;
  logs?: string;
  urls?: {
    get?: string;
    web?: string;
    cancel?: string;
  };
};
