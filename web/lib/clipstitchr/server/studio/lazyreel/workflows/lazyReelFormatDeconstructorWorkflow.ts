import type { LazyReelWorkflowDefinition } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowDefinition";

export const lazyReelFormatDeconstructorWorkflow: LazyReelWorkflowDefinition = {
  activation: ["A video link, description, transcript, or frame set needs structural analysis.", "A winning format needs a copyable FormatSpec."],
  inputs: ["Video link or supplied description/transcript", "Optional frames, captions, audio notes, and creator-baseline metrics"],
  key: "format_deconstructor",
  limitations: ["A URL is never fetched by this engine.", "Craft confidence stays low without supplied frames or audio.", "High views alone do not establish a copyable model."],
  outputSections: ["Why it broke out", "Shot-by-shot FormatSpec", "Replication instructions", "Confidence and false-positive labels"],
  principles: ["Judge creator-relative lift, engagement quality, product necessity, and recurrence.", "Name a viral mechanism and any false-positive label.", "Describe only visible or supplied evidence.", "Identify one signature device."],
  purpose: "Turn supplied evidence about a short-form video into a diagnosis and a prompt-ready structural specification.",
  sourceFiles: ["skills/lazyreel-format-deconstructor/SKILL.md", "skills/lazyreel-format-deconstructor/references/teardown-method.md"],
  stages: [
    { name: "Evidence inventory", instruction: "Separate supplied frames, transcript, audio, metrics, and URL-only claims; mark missing evidence." },
    { name: "Three-gate diagnosis", instruction: "Evaluate creator-relative lift, organic engagement quality, and product necessity plus recurrence." },
    { name: "FormatSpec", instruction: "Describe hook, retention, beats, craft, audio, prop, product role, and signature device without invention." },
    { name: "Replication", instruction: "Keep the structural mechanic, replace product moments, list changes, and record confidence." },
  ],
  title: "Format deconstructor",
};
