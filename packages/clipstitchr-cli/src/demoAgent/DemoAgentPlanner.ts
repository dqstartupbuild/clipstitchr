import type { DemoWalkthroughGuide } from "../demoGuide/DemoWalkthroughGuide.js";
import type { DemoWalkthroughStep } from "../demoGuide/DemoWalkthroughStep.js";
import type { DemoAgentAction } from "./DemoAgentAction.js";
import type { DemoAgentPageObservation } from "./DemoAgentPageObservation.js";
import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import type { DemoAgentStepState } from "./DemoAgentStepState.js";
import type { ScannedAppContext } from "../project/ScannedAppContext.js";

export type DemoAgentPlanner = (input: {
  appContext?: ScannedAppContext;
  guide: DemoWalkthroughGuide;
  observation: DemoAgentPageObservation;
  policy: DemoAgentPolicy;
  step: DemoWalkthroughStep;
  stepState: DemoAgentStepState;
}) => DemoAgentAction | Promise<DemoAgentAction>;
