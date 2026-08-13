import type { LazyReelResearchJobSelection } from "@/lib/clipstitchr/types/lazyreel/LazyReelResearchJobSelection";

export type LazyReelResearchJobDefinition = LazyReelResearchJobSelection & {
  description: string;
  title: string;
};

export const lazyReelResearchToolDefinitions: LazyReelResearchJobDefinition[] = [
  {
    kind: "tool",
    key: "niche_report",
    title: "Niche report",
    description: "Map formats, openings, trends, and gaps in a niche.",
  },
  {
    kind: "tool",
    key: "study_videos",
    title: "Study videos",
    description: "Search the real example set by hook, format, or niche.",
  },
  {
    kind: "tool",
    key: "teardown",
    title: "Format teardown",
    description: "Break down a transcript, description, public link, or product idea.",
  },
  {
    kind: "tool",
    key: "make_brief",
    title: "Make a brief",
    description: "Turn saved Product facts into hooks, ideas, or a full brief.",
  },
  {
    kind: "tool",
    key: "breakout_laws",
    title: "Breakout laws",
    description: "Read the repeatable findings and their evidence limits.",
  },
  {
    kind: "tool",
    key: "kill_the_slop",
    title: "Tighten copy",
    description: "Diagnose generic ad copy and rewrite it with a sharper hook.",
  },
  {
    kind: "tool",
    key: "get_status",
    title: "Corpus status",
    description: "See what the current snapshot actually contains.",
  },
];

export const lazyReelWorkflowDefinitions: LazyReelResearchJobDefinition[] = [
  {
    kind: "workflow",
    key: "format_deconstructor",
    title: "Format deconstructor",
    description: "Plan how to pull a reusable structure from a reference.",
  },
  {
    kind: "workflow",
    key: "format_prompt_builder",
    title: "Format prompt builder",
    description: "Shape a production prompt from an approved format.",
  },
  {
    kind: "workflow",
    key: "higgsfield_director",
    title: "Higgsfield director",
    description: "Prepare a shot plan and provider-ready direction.",
  },
  {
    kind: "workflow",
    key: "ugc_ad_director",
    title: "UGC ad director",
    description: "Plan performance, camera, proof, and edit beats.",
  },
  {
    kind: "workflow",
    key: "ugc_ad_generator",
    title: "UGC ad generator",
    description: "Prepare a production plan without claiming a finished video.",
  },
  {
    kind: "workflow",
    key: "video_editor",
    title: "Video editor",
    description: "Translate the brief into a practical editing plan.",
  },
];
