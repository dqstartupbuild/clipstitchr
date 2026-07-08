import type { DemoAgentPageObservation } from "./DemoAgentPageObservation.js";
import type { DemoAgentValidatedAction } from "./DemoAgentValidatedAction.js";
import { getDemoAgentClickTargetVisibleInObservation } from "./getDemoAgentClickTargetVisibleInObservation.js";
import { getDemoAgentTypeTargetVisibleInObservation } from "./getDemoAgentTypeTargetVisibleInObservation.js";
import { getDemoAgentUploadTargetVisibleInObservation } from "./getDemoAgentUploadTargetVisibleInObservation.js";

export function assertDemoAgentActionVisibleInObservation({
  action,
  observation,
}: {
  action: DemoAgentValidatedAction;
  observation: DemoAgentPageObservation;
}) {
  if (
    action.type === "click" &&
    !getDemoAgentClickTargetVisibleInObservation({
      observation,
      target: action.target,
    })
  ) {
    throw new Error(
      "The planned click target is not visible in the current page observation.",
    );
  }

  if (
    action.type === "type" &&
    !getDemoAgentTypeTargetVisibleInObservation({
      label: action.target.label,
      observation,
    })
  ) {
    throw new Error(
      "The planned type target is not visible in the current page observation.",
    );
  }

  if (
    action.type === "uploadFile" &&
    !getDemoAgentUploadTargetVisibleInObservation({
      label: action.target.label,
      observation,
      text: action.target.text,
    })
  ) {
    throw new Error(
      "The planned upload target is not visible in the current page observation.",
    );
  }
}
