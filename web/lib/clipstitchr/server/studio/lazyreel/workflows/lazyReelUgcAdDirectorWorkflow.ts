import type { LazyReelWorkflowDefinition } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowDefinition";

export const lazyReelUgcAdDirectorWorkflow: LazyReelWorkflowDefinition = {
  activation: ["A product brief needs Seedance-ready UGC prompts.", "A creator-style ad needs a multi-clip director package."],
  inputs: ["Product and brief", "Target duration", "Creator and product references"],
  key: "ugc_ad_director",
  limitations: ["Pinterest and provider pages are not browsed.", "No Seedance render or native audio generation occurs.", "Reference suitability must be verified by a human."],
  outputSections: ["Creator reference criteria", "Setting and product references", "Clip prompts and negatives", "Why each clip works", "Editor handoff"],
  principles: ["Use multiple short clips at every duration.", "Include positive, negative, and evidence fields per clip.", "Use phone-shot detail and natural light.", "Avoid over-produced film vocabulary.", "Product lands after the opening line."],
  purpose: "Turn research into a Seedance-oriented multi-clip UGC direction package without running a provider.",
  sourceFiles: ["skills/lazyreel-ugc-ad-director/SKILL.md", "skills/lazyreel-ugc-ad-director/references/breakout-prompting.md"],
  stages: [
    { name: "Creator criteria", instruction: "Specify one consistent creator look with natural light and clean reference-image requirements." },
    { name: "Sequence", instruction: "Build hook, problem or proof, switch or demo, and withheld payoff across duration-calibrated clips." },
    { name: "Prompt package", instruction: "Write each clip's positive prompt, restrictive negative prompt, quoted dialogue, and evidence note." },
    { name: "Approval gate", instruction: "Return a plan-only provider manifest and explicit cost/auth requirements." },
  ],
  title: "UGC ad director",
};
