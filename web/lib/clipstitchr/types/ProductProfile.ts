export type ProductProfile = {
  id: string;
  name: string;
  productDetails: string;
  audienceDetails: string;
  cliprPlaceholderFillers?: Record<string, string[]>;
  eligibleCliprHookStyleKeys?: string[];
  eligibleCliprHookTemplateIds?: string[];
  inferredProblem?: string;
  inferredPainPoints: string[];
  createdAt: string;
  updatedAt: string;
};
