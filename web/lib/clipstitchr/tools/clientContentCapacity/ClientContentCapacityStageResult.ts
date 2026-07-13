export type ClientContentCapacityStageResult = {
  deliverableCapacity: number | null;
  effectiveHours: number;
  key: "capture" | "editing" | "review";
  label: string;
};
