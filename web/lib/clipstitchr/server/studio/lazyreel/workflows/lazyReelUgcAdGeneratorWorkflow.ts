import type { LazyReelWorkflowDefinition } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowDefinition";

export const lazyReelUgcAdGeneratorWorkflow: LazyReelWorkflowDefinition = {
  activation: ["A product image and ad angle need an execution manifest.", "A Seedance sequence needs provider and stitching preparation."],
  inputs: ["Product image reference", "Product name and ad angle", "Target duration", "Optional brand context"],
  key: "ugc_ad_generator",
  limitations: ["No fal.ai request, download, Python script, shell script, or FFmpeg process is run.", "Provider cost and product-reference fidelity require explicit approval.", "The original Python and shell scripts are reference-only."],
  outputSections: ["Intake", "Angle and shot mode", "Manifest", "Provider request checklist", "Stitch plan", "Delivery contract"],
  principles: ["Use image-to-video for a controlled first frame and reference-to-video for continuity.", "Keep one action and one short dialogue beat per shot.", "Prepare every output path before provider execution.", "Preserve each clip and the stitched deliverable."],
  purpose: "Prepare an approved-ready Seedance/fal.ai generation and stitching manifest without executing upstream automation.",
  sourceFiles: ["skills/lazyreel-ugc-ad-generator/SKILL.md", "skills/lazyreel-ugc-ad-generator/references/angles.md", "skills/lazyreel-ugc-ad-generator/references/fal-api.md", "skills/lazyreel-ugc-ad-generator/references/prompting.md"],
  stages: [
    { name: "Intake", instruction: "Record product reference, angle, brand context, duration, output ownership, and cost approval state." },
    { name: "Shot manifest", instruction: "Choose image-to-video or reference-to-video per clip and write bounded request parameters." },
    { name: "Provider gate", instruction: "List credential, pricing, moderation, idempotency, retry, and approval requirements without calling fal.ai." },
    { name: "Assembly handoff", instruction: "Describe clip downloads, stable names, hard-cut ordering, audio normalization, and final artifact registration." },
  ],
  title: "UGC ad generator",
};
