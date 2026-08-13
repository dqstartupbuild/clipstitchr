import type { LazyReelMakeBriefMode } from "./LazyReelMakeBriefMode";

export type LazyReelMakeBriefData = {
  angle: null | { name: string; note: string; shots: number };
  audience: string;
  beats: Array<{
    beat: string;
    broll: string;
    onScreenText: string;
    voiceover: string;
  }>;
  breakoutChecklist: string[];
  concepts: Array<{
    awareness: string;
    framework: string;
    hook: string;
    structure: string[];
    visualApproach: string;
  }>;
  framework: null | { acronym: string; id: string; name: string };
  hooks: Array<{ delivery: string; pattern: string; text: string }>;
  mode: LazyReelMakeBriefMode;
  objective: string;
  product: string;
};
