import type { ClientContentCapacityStageResult } from "@/lib/clipstitchr/tools/clientContentCapacity/ClientContentCapacityStageResult";

export type ClientContentCapacityResult = {
  clientCapacity: number | null;
  currentClientCount: number;
  deliverablesPerClientPerWeek: number;
  isOverCapacity: boolean;
  limitingStage: ClientContentCapacityStageResult | null;
  productiveTimePercent: number;
  stageResults: ClientContentCapacityStageResult[];
  utilizationPercent: number | null;
  weeklyDeliverableCapacity: number | null;
};
