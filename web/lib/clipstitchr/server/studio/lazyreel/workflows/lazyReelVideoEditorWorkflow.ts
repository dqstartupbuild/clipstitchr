import type { LazyReelWorkflowDefinition } from "@/lib/clipstitchr/types/lazyreel/LazyReelWorkflowDefinition";

export const lazyReelVideoEditorWorkflow: LazyReelWorkflowDefinition = {
  activation: ["Two or more clips need a finished 9:16 edit.", "Raw or generated footage needs trimming, captions, audio, and assembly."],
  inputs: ["Ordered source clips", "Brief and breakout laws", "Target duration", "Caption and audio requirements"],
  key: "video_editor",
  limitations: ["No FFmpeg or Remotion command is executed by this planner.", "Actual duration, codecs, loudness, and safe-area placement require media inspection downstream."],
  outputSections: ["Edit decision list", "Trim and crop manifest", "Caption plan", "Audio plan", "Quality checklist", "Output artifact contract"],
  principles: ["Never ship one static clip.", "Use hard cuts and a high-density opening.", "Crop to 9:16 instead of letterboxing.", "Make the opening legible without sound.", "Normalize audio before delivery."],
  purpose: "Prepare a deterministic, inspectable edit decision list for a hook-first 9:16 deliverable.",
  sourceFiles: ["skills/lazyreel-video-editor/SKILL.md", "skills/lazyreel-video-editor/references/cut-rhythm.md"],
  stages: [
    { name: "Media inventory", instruction: "Record clip order, codec and duration inspection requirements, and choose the hook clip." },
    { name: "Edit decision list", instruction: "Assign trims, hard cuts, 9:16 crop decisions, product entry, and payoff timing." },
    { name: "Accessibility and audio", instruction: "Plan sound-off captions, safe-area placement, and loudness normalization." },
    { name: "Execution handoff", instruction: "Return stable artifact names and deterministic FFmpeg or Remotion job requirements without running them." },
  ],
  title: "Video editor",
};
