import type { AppHookTestingMatrixInput } from "@/lib/clipstitchr/tools/appHookTestingMatrix/AppHookTestingMatrixInput";

export const defaultAppHookTestingMatrixInput: AppHookTestingMatrixInput = {
  audience: "Busy app users who still use a manual workaround",
  offer: "The current paid app plan",
  stableCta: "See how the app works",
  hooks: [
    "Still doing this by hand?",
    "The tiny workflow change that cleaned up my week",
    "Watch this messy note become a useful task list",
  ],
  visuals: [
    "Messy manual workaround, then clean app demo",
    "App payoff first, then replay the action",
  ],
};
