import type { ShortFormAuditDimension } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditDimension";

export const shortFormAuditPlanDefinitions: Array<{
  action: string;
  day: number;
  dimension: ShortFormAuditDimension;
  title: string;
}> = [
  {
    action:
      "Write the audience, problem moment, and believable payoff on one page.",
    day: 1,
    dimension: "clarity",
    title: "Lock the message",
  },
  {
    action:
      "Choose one primary call to action and three claims you can support.",
    day: 2,
    dimension: "clarity",
    title: "Set the promise boundaries",
  },
  {
    action:
      "Count ready openings, demos, proof, and calls to action before planning new shoots.",
    day: 3,
    dimension: "assets",
    title: "Inventory what is ready",
  },
  {
    action:
      "Write a short capture list for the most important missing source material.",
    day: 4,
    dimension: "assets",
    title: "Plan the missing captures",
  },
  {
    action:
      "Capture or request the first missing source set with clean reusable handles.",
    day: 5,
    dimension: "assets",
    title: "Close the first asset gap",
  },
  {
    action:
      "Map your actual path from concept to capture, review, and delivery.",
    day: 6,
    dimension: "repeatability",
    title: "Map the workflow",
  },
  {
    action:
      "Choose one filename pattern for concept, source role, and version.",
    day: 7,
    dimension: "repeatability",
    title: "Make assets findable",
  },
  {
    action: "Define who owns the next action at every handoff.",
    day: 8,
    dimension: "repeatability",
    title: "Remove handoff ambiguity",
  },
  {
    action: "Name a current control and one major variable worth challenging.",
    day: 9,
    dimension: "testing",
    title: "Choose a controlled test",
  },
  {
    action:
      "Write the evidence floor and decision rule before the test starts.",
    day: 10,
    dimension: "testing",
    title: "Pre-commit the decision",
  },
  {
    action:
      "Build a small test queue that changes one major variable per challenger.",
    day: 11,
    dimension: "testing",
    title: "Prepare the test queue",
  },
  {
    action:
      "Schedule a short review and separate observations from interpretations.",
    day: 12,
    dimension: "learning",
    title: "Create the review habit",
  },
  {
    action:
      "Record what to keep, stop, and test next from the latest evidence.",
    day: 13,
    dimension: "learning",
    title: "Turn evidence into a decision",
  },
  {
    action:
      "Write one follow-up hypothesis and carry reusable assets into the next cycle.",
    day: 14,
    dimension: "learning",
    title: "Start the next learning loop",
  },
];
