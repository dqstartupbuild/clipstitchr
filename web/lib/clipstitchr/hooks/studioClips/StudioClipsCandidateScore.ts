import type { StudioClipsAnalysis } from "@/lib/clipstitchr/types/studioClips/StudioClipsAnalysis";

export type StudioClipsCandidateScore =
  StudioClipsAnalysis["candidates"][number]["score"];
