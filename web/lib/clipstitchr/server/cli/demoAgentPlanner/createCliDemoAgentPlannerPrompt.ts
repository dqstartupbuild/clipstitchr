import type { CliDemoAgentPlanRequest } from "@/lib/clipstitchr/server/cli/demoAgentPlanner/CliDemoAgentPlanRequest";

export function createCliDemoAgentPlannerPrompt(
  request: CliDemoAgentPlanRequest,
) {
  return JSON.stringify({
    allowedActionShape: {
      click:
        '{ "type": "click", "stepId": "...", "target": { "role": "button", "name": "..." }, "reason": "..." }',
      finishStep: '{ "type": "finishStep", "stepId": "...", "reason": "..." }',
      navigate: '{ "type": "navigate", "path": "/allowed-local-path" }',
      screenshot: '{ "type": "screenshot", "stepId": "..." }',
      stop: '{ "type": "stop", "reason": "..." }',
      type:
        '{ "type": "type", "target": { "label": "..." }, "valueKey": "approved-key" }',
      uploadFile:
        '{ "type": "uploadFile", "target": { "label": "..." }, "fileKey": "approved-file-key" }',
      waitFor:
        '{ "type": "waitFor", "visibleText": "...", "timeoutMs": 5000 }',
    },
    approvedTestValueKeys: request.approvedTestValueKeys,
    approvedUploadFileKeys: request.approvedUploadFileKeys,
    attemptedActionKeys: request.attemptedActionKeys,
    attemptedActionKeyRules: [
      "Never return an action whose key already appears in attemptedActionKeys.",
      "A screenshot action key is screenshot:<stepId>.",
      "A click action key is click:<role>:<name>.",
      "A finishStep action key is finishStep:<stepId>.",
      "If screenshot:<stepId> was already attempted and the current screen satisfies a show, review, point-out, or highlight-style step, return finishStep.",
      "If screenshot:<stepId> was already attempted and the current screen does not satisfy the step, choose a visible click, navigate to an allowed local path, wait for visible text, or stop.",
    ],
    guide: request.guide,
    instruction:
      "Choose the next single non-repeated action that advances the guide step and the overall demo goal using only the simplified observation. Do not invent hidden DOM details.",
    missingRequirementRules: [
      "Use guide.goal as the user's requested demo direction.",
      "If the current step or overall goal requires an asset, selected clip, connected account, existing project, generated result, or permission that is not visible or reachable from the observation, return stop.",
      "When returning stop for a missing requirement, explain the specific setup needed in plain language.",
      "Do not fake a completed goal when the required screen, asset, or result is not visible.",
    ],
    observation: request.observation,
    step: request.step,
  });
}
