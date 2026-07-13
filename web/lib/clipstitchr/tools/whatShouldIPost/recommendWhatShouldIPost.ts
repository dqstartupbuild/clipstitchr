import type { WhatShouldIPostInput } from "@/lib/clipstitchr/tools/whatShouldIPost/WhatShouldIPostInput";
import type { WhatShouldIPostResult } from "@/lib/clipstitchr/tools/whatShouldIPost/WhatShouldIPostResult";

export function recommendWhatShouldIPost(
  input: WhatShouldIPostInput,
): WhatShouldIPostResult {
  const hasDemo = input.assets.includes("app-demo");
  const hasUgc = input.assets.includes("ugc");

  if (input.goal === "retain" || input.funnelStage === "customer") {
    return {
      captures: hasDemo
        ? [
            "One clean feature walkthrough",
            "One before-state screen",
            "One finished-state screen",
          ]
        : [
            "Three clear app screenshots",
            "One written workflow",
            "One accurate product fact",
          ],
      format: "Useful feature walkthrough",
      nextToolKey: "app-demo-recording-checklist",
      prompts: [
        "Show one feature an existing user may have missed.",
        "Turn one repeatable app workflow into a 20-second habit.",
        "Answer one question that keeps current users from the next useful action.",
      ],
      reason:
        "Existing users need a useful reason to return, so this format teaches one real workflow instead of repeating a broad pitch.",
    };
  }

  if (input.funnelStage === "unaware") {
    return {
      captures: [
        "One recognizable problem moment",
        "One old-workaround shot",
        hasDemo
          ? "One brief product reveal"
          : "One accurate payoff description",
      ],
      format: "Problem-recognition story",
      nextToolKey: "app-ad-shot-list-generator",
      prompts: [
        "Show the frustrating moment before naming the product.",
        "Make the old workaround easy to recognize without exaggerating it.",
        "End with one honest product payoff, not a list of features.",
      ],
      reason:
        "The viewer does not know the problem yet, so the post should make the moment recognizable before asking them to understand a product.",
    };
  }

  if (hasDemo && input.goal === "reach") {
    return {
      captures: [
        "One recognizable problem frame",
        "One clean app action",
        "One readable payoff frame",
      ],
      format: "Problem-led app demo",
      nextToolKey: "app-demo-recording-checklist",
      prompts: [
        "Open on the annoying manual step, then reveal one simpler app action.",
        "Ask a recognizable problem question and answer it with the product on screen.",
        "Show the payoff first, then replay the one app action that created it.",
      ],
      reason:
        "Your reach goal needs a recognizable entry point, while the available demo gives the story a concrete product payoff.",
    };
  }

  if (input.goal === "convert" || input.funnelStage === "product-aware") {
    return {
      captures: hasDemo
        ? [
            "One objection-answering app flow",
            "One visible product fact",
            "One clear paid-plan next step",
          ]
        : [
            "One accurate product screenshot",
            "One written objection answer",
            "One clear paid-plan next step",
          ],
      format: "Product objection answer",
      nextToolKey: hasDemo
        ? "app-demo-recording-checklist"
        : "app-ad-shot-list-generator",
      prompts: [
        "Answer the question a product-aware viewer asks before paying.",
        "Show exactly what happens after the viewer takes the next step.",
        "Use one verifiable product fact to remove uncertainty without fake urgency.",
      ],
      reason:
        "A paid decision needs clarity about the product and next step, so this format answers one real objection instead of adding a broad promise.",
    };
  }

  if (hasUgc && input.cameraPreference === "on-camera") {
    return {
      captures: [
        "One honest opening take",
        "One visible problem moment",
        "One clean product handoff",
        "One grounded payoff take",
      ],
      format: "Creator problem-to-product story",
      nextToolKey: "app-ugc-ad-brief-template",
      prompts: [
        "Open with the moment this problem becomes annoying.",
        "Show the old workaround before the app appears.",
        "Explain the first useful app action without promising an outcome you cannot prove.",
      ],
      reason:
        "Your on-camera comfort and available creator footage make a human story practical without needing a complicated production.",
    };
  }

  if (hasDemo) {
    return {
      captures: [
        "One clean vertical app demo",
        "One readable opening frame",
        "One product payoff frame",
      ],
      format:
        input.capacity === "batch"
          ? "Three-angle app-demo batch"
          : input.capacity === "quick" ||
              input.cameraPreference === "off-camera"
            ? "Text-led app demo"
            : input.cameraPreference === "on-camera"
              ? "Founder-led app demo"
              : "Voiceover app demo",
      nextToolKey: "app-demo-recording-checklist",
      prompts: [
        "Start with the manual step your app replaces, then show one action.",
        "Show the payoff first, then replay how the app gets there.",
        "Answer one skeptical product question with a visible app moment.",
      ],
      reason:
        "A product demo is already available, so the fastest useful post is one clear product truth built around that footage.",
    };
  }

  return {
    captures: [
      "One opening visual",
      "One problem or context shot",
      "One accurate text description of the app payoff",
    ],
    format: "Simple problem-and-payoff post",
    nextToolKey: "app-ad-shot-list-generator",
    prompts: [
      "Name the frustrating moment your audience recognizes.",
      "Show the workaround without making a claim about your app yet.",
      "Describe one real app payoff and list the product footage you still need.",
    ],
    reason:
      "You do not need a finished demo to make progress. This format uses the context you have and turns the missing product footage into a clear capture list.",
  };
}
