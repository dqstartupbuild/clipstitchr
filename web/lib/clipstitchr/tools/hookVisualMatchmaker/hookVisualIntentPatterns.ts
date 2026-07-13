import type { PublicHookIntent } from "@/lib/clipstitchr/tools/publicHooks/PublicHookIntent";
import type { HookVisualIntentPattern } from "@/lib/clipstitchr/tools/hookVisualMatchmaker/HookVisualIntentPattern";

export const hookVisualIntentPatterns: Record<
  PublicHookIntent,
  HookVisualIntentPattern
> = {
  audience: {
    demoDirection: "Show the app moment that matters specifically to the named viewer.",
    openingDirection: "Start with direct recognition before introducing the product.",
    reason: "The audience callout feels earned when the person or situation appears first.",
  },
  comparison: {
    demoDirection: "Show only the side of the comparison your available footage can prove.",
    openingDirection: "Establish the old or alternate approach without inventing a second result.",
    reason: "A comparison needs a visible contrast, not just a stronger claim in the overlay.",
  },
  curiosity: {
    demoDirection: "Reveal the answer in the available product moment before the question feels vague.",
    openingDirection: "Hold back one useful detail while keeping the situation understandable.",
    reason: "The visual closes the open loop created by the hook.",
  },
  demonstration: {
    demoDirection: "Keep the input, action, and visible change in one readable sequence.",
    openingDirection: "Begin close to the product action instead of adding unrelated setup.",
    reason: "A demonstration hook works when the promised action starts immediately.",
  },
  discovery: {
    demoDirection: "Introduce one useful app moment rather than trying to explain every feature.",
    openingDirection: "Use a clean product reveal with one recognizable reason to care.",
    reason: "Product discovery is clearer when one moment carries the whole opening.",
  },
  objection: {
    demoDirection: "Answer the objection with the exact product moment already available.",
    openingDirection: "Let the opening acknowledge the hesitation without mocking the viewer.",
    reason: "The handoff works when the demo answers the concern instead of changing topics.",
  },
  outcome: {
    demoDirection: "Hold only on the outcome the available footage visibly supports.",
    openingDirection: "Hint at progress without presenting an unsupported result as guaranteed.",
    reason: "The desired outcome needs a visible, honest payoff.",
  },
  problem: {
    demoDirection: "Cut to the app at the moment the workflow begins addressing the friction.",
    openingDirection: "Start on a recognizable sign of the problem before showing the solution.",
    reason: "The demo becomes the answer to the frustration named in the hook.",
  },
};
