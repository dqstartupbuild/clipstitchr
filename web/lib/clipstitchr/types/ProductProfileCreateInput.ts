export type ProductProfileCreateInput = {
  name: string;
  productDetails: string;
  audienceDetails: string;
  emotionalNarrative?: string;
  websiteUrl?: string;
  inferredProblem?: string;
  inferredPainPoints?: string[];
  preferredCliprHookStyleKey?: string;
};
