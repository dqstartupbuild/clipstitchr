import type { ShortFormAuditQuestion } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditQuestion";

export const shortFormAuditQuestions: ShortFormAuditQuestion[] = [
  {
    action:
      "Write one audience, one painful moment, and one believable payoff in plain language.",
    dimension: "clarity",
    id: "clarity-audience-payoff",
    prompt:
      "Can your team name the audience, problem, and payoff without rewriting it each time?",
  },
  {
    action:
      "Set one primary next step for this campaign and remove competing calls to action.",
    dimension: "clarity",
    id: "clarity-cta",
    prompt:
      "Does each campaign have one clear action you want the viewer to take?",
  },
  {
    action: "Capture at least three reusable opening takes with clean handles.",
    assetGap: "Reusable UGC hooks or opening takes",
    dimension: "assets",
    id: "assets-openings",
    prompt:
      "Do you have several reusable UGC hooks or opening clips ready now?",
  },
  {
    action:
      "Record a readable app demo that shows the promised payoff and contains no private data.",
    assetGap: "Readable product-demo and proof footage",
    dimension: "assets",
    id: "assets-demos",
    prompt:
      "Do you have clean product demos and proof footage ready to pair with openings?",
  },
  {
    action:
      "Document the minimum path from idea to capture, review, and final delivery.",
    dimension: "repeatability",
    id: "repeatability-workflow",
    prompt:
      "Can a teammate follow a documented path from idea to finished creative?",
  },
  {
    action:
      "Adopt one naming rule that identifies concept, source role, and version.",
    dimension: "repeatability",
    id: "repeatability-naming",
    prompt:
      "Can you quickly identify and reuse the right source clips and versions?",
  },
  {
    action:
      "Choose a control and change only one major creative variable in the next challenger.",
    dimension: "testing",
    id: "testing-variable",
    prompt:
      "Do your creative tests name one main variable instead of changing everything at once?",
  },
  {
    action:
      "Write your own evidence floor and decision rule before the next test starts.",
    dimension: "testing",
    id: "testing-rule",
    prompt:
      "Do you decide the evidence and decision rule before reviewing a result?",
  },
  {
    action:
      "Add a short weekly review that records observations separately from guesses.",
    dimension: "learning",
    id: "learning-review",
    prompt: "Does the team review results on a consistent schedule?",
  },
  {
    action:
      "Turn the latest observation into one controlled follow-up hypothesis.",
    dimension: "learning",
    id: "learning-follow-up",
    prompt:
      "Does each review create a specific follow-up test or reusable lesson?",
  },
];
