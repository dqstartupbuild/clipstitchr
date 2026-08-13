import type { LazyReelWorkflowDefinition } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowDefinition";

export const lazyReelHiggsfieldDirectorWorkflow: LazyReelWorkflowDefinition = {
  activation: ["A validated brief needs Higgsfield-ready clip prompts.", "A long sequence needs a reference-versus-extend continuity plan."],
  inputs: ["LazyReel brief or FormatSpec", "Target duration", "Creator and product references"],
  key: "higgsfield_director",
  limitations: ["No Higgsfield provider call occurs here.", "No credit is spent and no virality score is fabricated.", "Reference images must be prepared and approved outside this planner."],
  outputSections: ["Clip sequence", "Positive prompt per clip", "Negative prompt per clip", "Why-it-works evidence", "Render and editor handoff"],
  principles: ["Never render one long clip.", "Lock the opening with a controlled first frame.", "Use extend for continuous performance and fresh references for distinct framings.", "Tie every clip to an opening law or measured lift."],
  purpose: "Prepare a complete Higgsfield multi-clip prompt manifest without making external provider calls.",
  sourceFiles: ["skills/lazyreel-higgsfield-director/SKILL.md", "skills/lazyreel-higgsfield-director/references/breakout-insights.md"],
  stages: [
    { name: "Research pull", instruction: "Attach the brief, breakout laws, and strongest matching format evidence." },
    { name: "Clip design", instruction: "Map each beat to one 9:16 action clip with a controlled literal first frame." },
    { name: "Prompt package", instruction: "Write a positive prompt, negative list, continuity method, and evidence note for every clip." },
    { name: "Approval gate", instruction: "Stop at an approved-ready manifest until provider credentials and user authorization are present." },
  ],
  title: "Higgsfield director",
};
