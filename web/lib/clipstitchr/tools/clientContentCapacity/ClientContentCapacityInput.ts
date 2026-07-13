import type { ClientContentCapacityStageInput } from "@/lib/clipstitchr/tools/clientContentCapacity/ClientContentCapacityStageInput";

export type ClientContentCapacityInput = {
  capture: ClientContentCapacityStageInput;
  currentClientCount: number;
  deliverablesPerClientPerWeek: number;
  editing: ClientContentCapacityStageInput;
  productiveTimePercent: number;
  review: ClientContentCapacityStageInput;
};
