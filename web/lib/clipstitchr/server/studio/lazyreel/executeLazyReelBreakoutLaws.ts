import type { LazyReelBreakoutLawsData } from "@/lib/clipstitchr/types/lazyreel/LazyReelBreakoutLawsData";
import type { LazyReelToolResult } from "@/lib/clipstitchr/types/lazyreel/LazyReelToolResult";
import { getLazyReelCorpusSnapshot } from "./getLazyReelCorpusSnapshot";
import { lazyReelSnapshotVersion } from "./lazyReelSnapshotVersion";

export function executeLazyReelBreakoutLaws(): LazyReelToolResult<LazyReelBreakoutLawsData> {
  const model = getLazyReelCorpusSnapshot().breakoutModel;
  const validation = model.validation;
  const data: LazyReelBreakoutLawsData = {
    appAdArchetypes: (model.appAdBreakoutFormats?.hookArchetypes ?? []).map((item) => ({
      copyDecision: item.copyDecision,
      durationRequirement: item.durationRequirement,
      id: item.id,
      template: item.template,
    })),
    caveats: [
      model.confound?.takeaway ??
        "Raw views are confounded by audience size; compare creative against the same creator's baseline.",
      "The causal explanation is inferred from still frames, not watch-time or a controlled creative experiment.",
    ],
    conceptPairs: (model.conceptControlledPairs ?? []).slice(0, 3).map((item) => ({
      concept: item.concept,
      firstFrameDelta: item.firstFrameDelta,
      gap: item.gap,
      lesson: item.lesson,
    })),
    contrasts: Object.values(model.corpusContrast ?? {})
      .flat()
      .filter((item): item is { lift: number; pctHigh: number; pctLow: number; value: string } =>
        Boolean(item && item.lift !== null),
      )
      .sort((left, right) => right.lift - left.lift || left.value.localeCompare(right.value))
      .slice(0, 8)
      .map((item) => ({
        breakoutPercent: item.pctHigh,
        label: item.value,
        lift: item.lift,
        lowPercent: item.pctLow,
      })),
    laws: (model.laws ?? []).map((item) => ({
      corpusEcho: item.corpusEcho ?? null,
      evidence: item.evidence,
      law: item.law,
    })),
    validation: validation
      ? {
          baseline: validation.baseline ?? "50%",
          interpretation: validation.interpretation ?? "",
          method: validation.method ?? "",
          pooled: validation.pooled ?? "",
          tests: (validation.tests ?? []).map((item) => ({
            accuracy: item.accuracy,
            name: item.name,
            reads: item.reads ?? null,
          })),
        }
      : null,
  };

  return {
    data,
    evidence: [
      {
        detail: `${data.laws.length} laws are stored with matched-pair evidence and corpus echoes.`,
        kind: "derived",
        label: "First-three-second laws",
        sample: data.laws.length,
        snapshotVersion: lazyReelSnapshotVersion,
        source: "mcp/data/breakout-vs-dud.json",
      },
      {
        detail: validation?.method ?? "No validation record is available.",
        kind: "derived",
        label: "Blind validation record",
        sample: 2_780,
        snapshotVersion: lazyReelSnapshotVersion,
        source: "mcp/data/breakout-vs-dud.json validation",
      },
    ],
    limitations: [
      ...data.caveats,
      "The snapshot includes derived pair descriptions and summary validation, not every frame used to reproduce the blind test.",
    ],
    links: [],
    methodology:
      model.method ??
      "Concept-matched winner/dud pairs are compared frame by frame and cross-checked against corpus lift.",
    sections: [
      {
        id: "laws",
        items: data.laws.map((item) => `${item.law}: ${item.corpusEcho ?? item.evidence}`),
        title: "The first-three-second laws",
      },
      {
        id: "contrasts",
        items: data.contrasts.map(
          (item) =>
            `${item.label}: ${item.lift}x (${item.breakoutPercent}% of winners vs ${item.lowPercent}% of duds)`,
        ),
        title: "What over-indexes",
      },
      {
        id: "proof",
        items: data.conceptPairs.map((item) => `${item.concept} (${item.gap}): ${item.lesson}`),
        title: "Concept-matched proof",
      },
    ],
    summary:
      "Five snapshot-derived opening laws with concept-matched evidence, corpus contrasts, and a validation record.",
    title: "Breakout versus dud",
    tool: "breakout_laws",
  };
}
