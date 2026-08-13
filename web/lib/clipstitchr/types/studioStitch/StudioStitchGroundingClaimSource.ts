export type StudioStitchGroundingClaimSource =
  | {
      readonly kind: "productProfile";
      readonly field:
        | "name"
        | "productDetails"
        | "audienceDetails"
        | "emotionalNarrative"
        | "inferredProblem"
        | "inferredPainPoints";
      readonly sourceIndex: number | null;
    }
  | {
      readonly kind: "hookLabCreativeBrief";
      readonly field: "productProof";
      readonly sourceIndex: null;
    };
