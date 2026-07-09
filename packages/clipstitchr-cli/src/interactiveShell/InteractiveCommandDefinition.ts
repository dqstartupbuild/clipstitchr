export type InteractiveCommandDefinition = {
  completion: "continue" | "run";
  description: string;
  searchTerms?: string[];
  value: string;
};
