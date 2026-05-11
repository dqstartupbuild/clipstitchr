import type { CliprHookStyle } from "@/lib/clipstitchr/types/CliprHookStyle";

export const cliprHookStyles: CliprHookStyle[] = [
  {
    styleKey: "mystery_gap",
    styleName: "Mystery Gap",
    sourceCategory: "Curiosity",
    coreIntent: "Create an unanswered question the viewer wants resolved.",
    generationPrinciple:
      "Hide one important piece of information so the viewer stays to resolve it.",
  },
  {
    styleKey: "authority_signal",
    styleName: "Authority Signal",
    sourceCategory: "Expertise",
    coreIntent:
      "Borrow credibility from expertise, research, data, or experience.",
    generationPrinciple:
      "Make the hook feel informed, tested, or expert-backed without inventing facts.",
  },
  {
    styleKey: "anti_advice",
    styleName: "Anti-Advice",
    sourceCategory: "Contrarian",
    coreIntent: "Challenge the obvious, popular, or default advice.",
    generationPrinciple:
      "Challenge common advice while giving the viewer a useful replacement idea.",
  },
  {
    styleKey: "inside_room",
    styleName: "Inside Room",
    sourceCategory: "Insider",
    coreIntent:
      "Reveal hidden rules, incentives, or behind-the-scenes knowledge.",
    generationPrinciple:
      "Make the viewer feel they are getting access to practical inside knowledge.",
  },
  {
    styleKey: "direct_diagnosis",
    styleName: "Direct Diagnosis",
    sourceCategory: "Callout",
    coreIntent:
      "Name the viewer's behavior problem or blind spot directly.",
    generationPrinciple:
      "Speak directly to the viewer's mistake without insulting them.",
  },
  {
    styleKey: "before_after_arc",
    styleName: "Before/After Arc",
    sourceCategory: "Transformation",
    coreIntent: "Show movement from a bad state to a better state.",
    generationPrinciple:
      "Show visible movement from a current problem to a desired outcome.",
  },
  {
    styleKey: "cost_alert",
    styleName: "Cost Alert",
    sourceCategory: "Warning",
    coreIntent: "Make the viewer feel the cost of continuing a mistake.",
    generationPrinciple:
      "Make inaction feel expensive while still giving the viewer useful next steps.",
  },
  {
    styleKey: "deadline_pull",
    styleName: "Deadline Pull",
    sourceCategory: "FOMO",
    coreIntent:
      "Create urgency around timing, opportunity, or missed advantage.",
    generationPrinciple:
      "Create urgency around timing without fake scarcity.",
  },
  {
    styleKey: "receipt_stack",
    styleName: "Receipt Stack",
    sourceCategory: "Proof",
    coreIntent:
      "Use evidence, results, examples, or tests to support the claim.",
    generationPrinciple:
      "Use evidence, comparison, or measurement without fake statistics.",
  },
  {
    styleKey: "future_cast",
    styleName: "Future Cast",
    sourceCategory: "Prediction",
    coreIntent: "Show what is likely to happen next and why it matters.",
    generationPrinciple:
      "Help viewers prepare for a coming shift with grounded reasoning.",
  },
  {
    styleKey: "test_drive",
    styleName: "Test Drive",
    sourceCategory: "Experiment",
    coreIntent:
      "Show what happened after trying, comparing, or testing something.",
    generationPrinciple:
      "Let the creator take the risk or effort for the viewer.",
  },
  {
    styleKey: "pattern_break",
    styleName: "Pattern Break",
    sourceCategory: "Shock",
    coreIntent:
      "Open with a surprising result, stat, contrast, or outcome.",
    generationPrinciple:
      "Open with something that violates expectation but can still be explained.",
  },
  {
    styleKey: "vulnerable_reveal",
    styleName: "Vulnerable Reveal",
    sourceCategory: "Confession",
    coreIntent: "Admit something honest, uncomfortable, or personal.",
    generationPrinciple:
      "Start with honest tension or a practical mistake, not fake vulnerability.",
  },
  {
    styleKey: "viewer_dare",
    styleName: "Viewer Dare",
    sourceCategory: "Challenge",
    coreIntent: "Pull the viewer into a challenge or self-test.",
    generationPrinciple:
      "Invite the viewer to participate with a clear reveal or payoff.",
  },
  {
    styleKey: "cold_open_story",
    styleName: "Cold Open Story",
    sourceCategory: "Storytime",
    coreIntent: "Start inside a specific moment that needs resolution.",
    generationPrinciple:
      "Drop the viewer into a specific moment before explaining context.",
  },
];
