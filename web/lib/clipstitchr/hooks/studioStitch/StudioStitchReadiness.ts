export type StudioStitchReadiness = {
  providers: Array<{
    provider: "dansugc" | "gemini" | "elevenlabs" | "render";
    capability:
      | "reactionFootage"
      | "demoIntelligence"
      | "voiceWordTimings"
      | "mediaRendering";
    state: "configured" | "unavailable";
    reason: string | null;
  }>;
  state: "configured" | "unavailable";
  execution: "notStarted";
};
