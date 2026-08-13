import type { LazyReelWorkflowDefinition } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowDefinition";

export const lazyReelFormatPromptBuilderWorkflow: LazyReelWorkflowDefinition = {
  activation: ["A brief or FormatSpec needs a cut timeline.", "A short or long video needs pacing and framing decisions."],
  inputs: ["Brief or FormatSpec", "Target duration", "Optional product and format evidence"],
  key: "format_prompt_builder",
  limitations: ["This produces a timeline, not provider prompts or rendered clips.", "Duration allocation is a planning heuristic."],
  outputSections: ["Cut-by-cut timeline", "Framing inventory", "Cut-density map", "Energy arc"],
  principles: ["Use one distinct clip per beat.", "Cut every 1.5 to 3 seconds in the first half.", "Open on an unresolved visual question.", "Name one signature device.", "Describe capture results, not effects jargon."],
  purpose: "Convert a brief into an anti-cinematic cut and pacing plan whose clip count follows duration.",
  sourceFiles: ["skills/lazyreel-format-prompt-builder/SKILL.md", "skills/lazyreel-format-prompt-builder/references/cut-timeline.md"],
  stages: [
    { name: "Beat map", instruction: "Reduce the brief to one action beat per clip and identify the withheld payoff." },
    { name: "Timeline", instruction: "Assign time windows and literal opening frames, beginning with the unresolved hook." },
    { name: "Pacing", instruction: "Map early high density, mid-story modulation, and a hard-ended payoff." },
    { name: "Handoff", instruction: "Produce a clip manifest ready for a director and video editor." },
  ],
  title: "Format prompt builder",
};
