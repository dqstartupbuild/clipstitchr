import type { AppAdCreativeTestingBlueprintInput } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/AppAdCreativeTestingBlueprintInput";
import type { BlueprintLane } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintLane";
import type { BlueprintLaneKey } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/BlueprintLaneKey";
import { getBlueprintImprovementPhrase } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/getBlueprintImprovementPhrase";

export function createBlueprintLane(
  key: BlueprintLaneKey,
  input: AppAdCreativeTestingBlueprintInput,
): BlueprintLane {
  const improvement = getBlueprintImprovementPhrase(input.metricDirection);
  const primarySignal = `${input.primaryMetric} should ${improvement}`;

  switch (key) {
    case "audience-message":
      return {
        key,
        title: "Audience-message fit",
        learningQuestion: `Which framing makes ${input.audience} recognize that ${input.appName} is relevant?`,
        hypothesis: `If the opening names ${input.mainObjection} in language ${input.audience} recognizes, then ${primarySignal} because the product outcome will feel more personally relevant.`,
        changedVariable: "Audience-message framing",
        fixedControls: [
          "Same opening footage",
          "Same product demo",
          "Same call to action",
        ],
        controlDirection: "Keep the current message framing.",
        challengerDirections: [
          `Lead with the objection: ${input.mainObjection}.`,
          `Lead with the desired change: ${input.productOutcome}.`,
        ],
        leadingSignal:
          "Qualified click-through or engagement from the named audience",
        primarySignal,
        nextLearningAction:
          "Carry the clearest framing into a hook test without changing the demo.",
        variableAssetKey: "hooks",
      };
    case "hook":
      return {
        key,
        title: "Hook direction",
        learningQuestion:
          "Which opening idea earns enough attention for the same product moment?",
        hypothesis: `If the hook creates a clearer reason to watch for ${input.audience}, then ${primarySignal} because more of the right viewers will reach the unchanged demo.`,
        changedVariable: "Hook direction",
        fixedControls: [
          "Same opening source clip",
          "Same product demo",
          "Same call to action",
        ],
        controlDirection: "Keep the current hook as the control.",
        challengerDirections: [
          `Use a direct audience callout for ${input.audience}.`,
          `Connect ${input.mainObjection} to ${input.productOutcome}.`,
        ],
        leadingSignal: "Early-view retention before the product demo begins",
        primarySignal,
        nextLearningAction:
          "Keep the strongest hook and test a different opening visual underneath it.",
        variableAssetKey: "hooks",
      };
    case "visual-opening":
      return {
        key,
        title: "Visual opening",
        learningQuestion:
          "Which first visual makes the unchanged hook easier to understand?",
        hypothesis: `If the first visual makes ${input.mainObjection} or the product action immediately visible, then ${primarySignal} because viewers will not need extra setup to follow the hook.`,
        changedVariable: "Opening source footage",
        fixedControls: [
          "Same hook words",
          "Same product-demo payoff",
          "Same call to action",
        ],
        controlDirection: "Keep the current first shot.",
        challengerDirections: [
          "Open on a recognizable human reaction or problem moment.",
          `Open close to the ${input.appName} action that leads toward ${input.productOutcome}.`,
        ],
        leadingSignal:
          "Early-view retention with the same written or spoken hook",
        primarySignal,
        nextLearningAction:
          "Carry the clearest opening source into the demo-clarity lane.",
        variableAssetKey: "ugcOpenings",
      };
    case "demo-clarity":
      return {
        key,
        title: "Product-demo clarity",
        learningQuestion: `Which demo treatment makes the path to ${input.productOutcome} easiest to follow?`,
        hypothesis: `If the demo shows one complete ${input.appName} action with a readable before-state and result, then ${primarySignal} because the product proof will require less interpretation.`,
        changedVariable: "Product-demo treatment",
        fixedControls: [
          "Same hook and opening footage",
          "Same message promise",
          "Same call to action",
        ],
        controlDirection: "Keep the current product-demo cut.",
        challengerDirections: [
          "Start from a clean before-state and show one complete action.",
          "Reach the useful result sooner and hold it long enough to read.",
        ],
        leadingSignal:
          "View-through from the opening into the visible product result",
        primarySignal,
        nextLearningAction:
          "Keep the clearest demo and test only the proof or objection framing next.",
        variableAssetKey: "demos",
      };
    case "proof-objection": {
      const proofDirection = input.approvedProof
        ? `Show only this approved proof beside the relevant product moment: ${input.approvedProof}`
        : "Capture one verifiable proof moment before making a stronger claim.";

      return {
        key,
        title: "Proof and objection",
        learningQuestion: `What visible evidence can answer “${input.mainObjection}” without overclaiming?`,
        hypothesis: `If the creative answers ${input.mainObjection} with evidence the viewer can see, then ${primarySignal} because the same outcome will feel more credible.`,
        changedVariable: "Proof treatment",
        fixedControls: [
          "Same hook and opening footage",
          "Same product-demo sequence",
          "Same call to action",
        ],
        controlDirection: "Keep the current supported proof treatment.",
        challengerDirections: [
          proofDirection,
          "Answer the objection with the visible product action; remove any claim the footage cannot support.",
        ],
        leadingSignal:
          "Continued viewing through the evidence or objection answer",
        primarySignal,
        nextLearningAction:
          "Keep only the evidence the footage supports, then test the next-step language.",
        variableAssetKey: "proofAssets",
      };
    }
    case "cta":
      return {
        key,
        title: "Call to action",
        learningQuestion:
          "Which honest next step best matches the promise already shown?",
        hypothesis: `If the call to action connects directly to ${input.productOutcome}, then ${primarySignal} because the next step will feel like a continuation of the demo rather than a new promise.`,
        changedVariable: "Call-to-action direction",
        fixedControls: [
          "Same hook and opening footage",
          "Same product demo",
          "Same proof treatment",
        ],
        controlDirection: "Keep the current call to action.",
        challengerDirections: [
          "Use a low-friction next step that accurately describes what happens next.",
          `Connect the next step directly to ${input.productOutcome}.`,
        ],
        leadingSignal: "Action intent after the same product proof",
        primarySignal,
        nextLearningAction:
          "Keep the clearest next step and carry the full control into a close iteration.",
        variableAssetKey: "ctas",
      };
    case "refresh":
      return {
        key,
        title: "Creative refresh",
        learningQuestion:
          "Can a new presentation earn attention without changing the proven message?",
        hypothesis: `If the proven message appears through a visibly different opening pattern, then ${primarySignal} because the creative can feel new without discarding what the team already learned.`,
        changedVariable: "Opening presentation",
        fixedControls: [
          "Same proven message",
          "Same product-demo payoff",
          "Same call to action",
        ],
        controlDirection: "Keep the current best-performing presentation.",
        challengerDirections: [
          "Use a different creator, setting, or reaction while preserving the message.",
          "Use a new visual rhythm or first action while preserving the demo payoff.",
        ],
        leadingSignal:
          "Recovered early-view attention against the existing control",
        primarySignal,
        nextLearningAction:
          "Promote only a refresh that preserves the control's downstream quality.",
        variableAssetKey: "ugcOpenings",
      };
  }
}
