export function createStudioClipsAnalysisPrompt(input: {
  durationSeconds: number;
  includeBroll: boolean;
  transcript: string;
}): string {
  return [
    "Select the strongest standalone short-form clips from this timestamped transcript.",
    "Return JSON only and follow the supplied schema.",
    "Use contiguous source ranges. Never invent dialogue, claims, context, or timestamps.",
    "Prefer 2-5 complete moments with an immediate hook, concrete value, clear payoff, emotional weight, or a self-contained story.",
    "Prefer 25-50 seconds. Accept 15-60 seconds. If the whole source is shorter than 15 seconds, one full-source candidate is allowed.",
    "Score hook, retention, clarity, shareability, and overall from 0 to 100.",
    "Each reasoning entry must cite something present in the selected span.",
    input.includeBroll
      ? "Include at most one specific portrait-stock-video search opportunity per candidate when a visual cutaway genuinely helps. Its startSeconds is relative to the beginning of that candidate, not the full source."
      : "Return an empty brollOpportunities array.",
    `The source duration is ${input.durationSeconds.toFixed(3)} seconds.`,
    "Transcript:",
    input.transcript,
  ].join("\n\n");
}
