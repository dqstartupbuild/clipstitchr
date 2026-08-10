export type ProductProfile = {
  id: string;
  name: string;
  productDetails: string;
  audienceDetails: string;
  emotionalNarrative?: string;
  websiteUrl?: string;
  cliprPlaceholderFillers?: Record<string, string[]>;
  eligibleCliprHookStyleKeys?: string[];
  eligibleCliprHookTemplateIds?: string[];
  inferredProblem?: string;
  inferredPainPoints: string[];
  preferredCliprHookStyleKey?: string;
  socialPublishingSocialAccountIds?: string[];
  createdAt: string;
  updatedAt: string;
};
