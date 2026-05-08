import type { SwaprPredictionStatus } from "@/lib/clipstitchr/types/SwaprPredictionStatus";

export type SwaprPredictionResponse = {
  id: string;
  status: SwaprPredictionStatus;
  output?: unknown;
  error?: unknown;
  logs?: string;
  urls?: {
    get?: string;
    web?: string;
    cancel?: string;
  };
};
