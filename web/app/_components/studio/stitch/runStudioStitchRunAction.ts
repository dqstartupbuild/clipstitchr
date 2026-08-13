import type { StudioStitchGenerationRun } from "@/lib/clipstitchr/hooks/studioStitch/StudioStitchGenerationRun";

export async function runStudioStitchRunAction(
  run: StudioStitchGenerationRun,
  action: "cancel" | "resume" | "retry",
  updateRun: (
    run: StudioStitchGenerationRun,
    action: "cancel" | "resume" | "retry",
  ) => Promise<StudioStitchGenerationRun | null>,
  onUpdated: (run: StudioStitchGenerationRun) => void,
) {
  const next = await updateRun(run, action);
  if (next) {
    onUpdated(next);
  }
}
