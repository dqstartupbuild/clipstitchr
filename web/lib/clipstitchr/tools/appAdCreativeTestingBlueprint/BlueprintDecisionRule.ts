export type BlueprintDecisionRule = {
  outcome: "hold" | "promote" | "iterate" | "retire" | "continue";
  label: string;
  condition: string;
  nextAction: string;
};
