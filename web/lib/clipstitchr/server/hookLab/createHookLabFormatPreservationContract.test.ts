import { describe, expect, it } from "vitest";
import { createHookLabFormatPreservationContract } from "@/lib/clipstitchr/server/hookLab/createHookLabFormatPreservationContract";
import type { HookLabPostAnalysis } from "@/lib/clipstitchr/types/HookLabPostAnalysis";

describe("createHookLabFormatPreservationContract", () => {
  it("foregrounds the recognizable creative structure before adaptation", () => {
    const contract = createHookLabFormatPreservationContract({
      analysis: {
        callToAction: "The completed task is the payoff.",
        caption: "Source caption",
        contentSummary: "A forced morning push-up demonstration.",
        format: "POV product demonstration",
        formatDna: {
          adObviousness: "Product appears after the opening.",
          confidence: "High",
          ctaStyle: "Implied utility",
          doNotCopy: [],
          editRhythm: "Fast reps synced to the beat.",
          firstPayoff: "The phone reveals the task.",
          firstPayoffAtSeconds: 3.2,
          hookPattern: "Relatable struggle plus a strange rule.",
          inferences: [],
          observedEvidence: [],
          openingQuestion: "Why can the alarm not be stopped?",
          openingVisual: "A distressed face on a pillow.",
          productFirstAppearsAtSeconds: 3.2,
          productRole: "Hero",
          proofDevice: "Incrementing completion counter",
          replicationFormula:
            "Morning struggle, phone reveal, counted task, relief.",
          retentionDevice: "A count that viewers wait to see completed.",
          signatureDevice: "Push-up counter",
          soundOffSummary: "A tired person completes push-ups.",
          storyBeats: ["Wake up", "Reveal task", "Complete reps", "Relief"],
          storyFramework: "Problem, solution, demonstration",
          version: "format-dna-v1",
        },
        onScreenText: ["POV: your alarm will not stop"],
        openingHook: "The alarm requires ten push-ups.",
        performance: {
          confidence: "High",
          engagementExplanation: "Clear visual premise.",
          hookScore: 80,
          limitations: [],
          overallScore: 75,
          pacingScore: 80,
          platformFitScore: 80,
          retentionExplanation: "The counter creates an open loop.",
          strengths: [],
        },
        recreationEssentials: [
          "Distressed wake-up",
          "Phone reveal",
          "Counted push-ups",
        ],
        timeline: [
          {
            endSeconds: 2.4,
            startSeconds: 0,
            visual: "A distressed face on a pillow.",
          },
          {
            endSeconds: 13.16,
            startSeconds: 2.4,
            visual: "Phone reveal followed by ten push-ups.",
          },
        ],
        transferableLessons: [],
      } satisfies HookLabPostAnalysis,
      sourceText: "Imported source caption",
    });

    expect(contract).toMatchObject({
      approximateRuntimeSeconds: 13.16,
      beatCount: 2,
      editRhythm: "Fast reps synced to the beat.",
      hookPattern: "Relatable struggle plus a strange rule.",
      openingVisual: "A distressed face on a pillow.",
      proofDevice: "Incrementing completion counter",
      sourceCaption: "Imported source caption",
      storyBeats: ["Wake up", "Reveal task", "Complete reps", "Relief"],
    });
  });
});
