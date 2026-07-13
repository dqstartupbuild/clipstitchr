import type { AppUgcClipQuestion } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipQuestion";

export const appUgcClipQuestions: AppUgcClipQuestion[] = [
  {
    id: "center-safe-framing",
    prompt:
      "The important face, hands, and action stay near the center with breathing room for text and app controls.",
    target: "A subject that remains useful after a careful vertical crop.",
    fix: "Record again with the important face, hands, or action farther from the outer edges.",
    weight: 10,
    isCritical: true,
    isSpokenOnly: false,
  },
  {
    id: "opening-motion",
    prompt: "An intentional expression or action starts in the first second.",
    target: "A visible reason to look before the opening stalls.",
    fix: "Start the useful expression or action earlier and remove the empty setup beat.",
    weight: 8,
    isCritical: false,
    isSpokenOnly: false,
  },
  {
    id: "spoken-clarity",
    prompt: "The spoken words sound clear, complete, and easy to understand.",
    target: "A clean voice take without clipped words or distracting noise.",
    fix: "Record the line again in a quieter space and leave the first and last word intact.",
    weight: 8,
    isCritical: false,
    isSpokenOnly: true,
  },
  {
    id: "clean-handles",
    prompt:
      "The clip has a clean beginning and ending without a cut-off word or action.",
    target: "A short clean beat before and after the useful moment.",
    fix: "Record another take with a brief pause before starting and after finishing.",
    weight: 8,
    isCritical: false,
    isSpokenOnly: false,
  },
  {
    id: "single-beat",
    prompt:
      "The clip contains one reusable beat instead of a pre-edited montage.",
    target:
      "One line, expression, or action that can be paired with different demos.",
    fix: "Split the footage into separate files so each clip does one clear job.",
    weight: 8,
    isCritical: false,
    isSpokenOnly: false,
  },
  {
    id: "clean-source",
    prompt:
      "Music, captions, watermarks, transitions, and app-demo footage are not permanently baked in.",
    target: "A clean source clip that can accept a different edit later.",
    fix: "Request or record a clean source file without permanent edit treatments or an embedded product demo.",
    weight: 8,
    isCritical: false,
    isSpokenOnly: false,
  },
  {
    id: "usage-approved",
    prompt:
      "The needed usage approval is documented for the way this clip will be used.",
    target:
      "A recorded approval that matches the planned channel, term, and usage.",
    fix: "Pause production until the needed usage approval is recorded. This checker cannot verify legal rights for you.",
    weight: 5,
    isCritical: true,
    isSpokenOnly: false,
  },
];
