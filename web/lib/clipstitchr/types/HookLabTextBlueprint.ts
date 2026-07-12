export type HookLabTextBlueprint = {
  cadence: string;
  claimsRequiringSupport: string[];
  emotionalJob: string;
  exactReuseConstraints: string[];
  productSpecificTokens: string[];
  reusablePattern: string;
  semanticSlots: {
    fallbackValue?: string;
    meaning: string;
    name: string;
  }[];
  sourceNiche?: string;
  sourceText: string;
  unresolvedVisualReferences: string[];
};
