import type { QuickEditCandidate } from "@/lib/clipstitchr/types/QuickEditCandidate";
import { createQuickEditDetectorSource } from "@/lib/clipstitchr/server/createQuickEditDetectorSource";
import { createQuickEditSilenceCandidates } from "@/lib/clipstitchr/server/createQuickEditSilenceCandidates";
import { createQuickEditVisualCandidates } from "@/lib/clipstitchr/server/createQuickEditVisualCandidates";
import { extractQuickEditDetectorFrameSamples } from "@/lib/clipstitchr/server/extractQuickEditDetectorFrameSamples";
import { extractQuickEditSilenceRanges } from "@/lib/clipstitchr/server/extractQuickEditSilenceRanges";
import { normalizeQuickEditDetectorCandidates } from "@/lib/clipstitchr/server/normalizeQuickEditDetectorCandidates";

export async function createQuickEditDetectorCandidates({
  file,
  sourceUrl,
}: {
  file?: File;
  sourceUrl?: string;
}) {
  let source:
    | Awaited<ReturnType<typeof createQuickEditDetectorSource>>
    | undefined;
  try {
    source = await createQuickEditDetectorSource({ file, sourceUrl });

    if (!source) {
      return [];
    }

    const [frameResult, silenceResult] = await Promise.allSettled([
      extractQuickEditDetectorFrameSamples(source.input),
      extractQuickEditSilenceRanges(source.input),
    ]);
    const candidates: QuickEditCandidate[] = [];

    if (frameResult.status === "fulfilled") {
      candidates.push(...createQuickEditVisualCandidates(frameResult.value));
    }

    if (silenceResult.status === "fulfilled") {
      candidates.push(...createQuickEditSilenceCandidates(silenceResult.value));
    }

    return normalizeQuickEditDetectorCandidates(candidates);
  } catch {
    return [];
  } finally {
    await source?.cleanup?.();
  }
}
