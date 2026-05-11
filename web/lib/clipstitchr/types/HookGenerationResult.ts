export type HookGenerationResult =
  | {
      purpose: "swipr-slides";
      slides: string[];
    }
  | {
      purpose: "stitchr-overlay";
      text: string;
    };
