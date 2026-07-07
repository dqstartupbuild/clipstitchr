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
    instruction:
      "Choose the next single action that advances the guide step using only the simplified observation. Do not invent hidden DOM details.",
    observation: request.observation,
    step: request.step,
  });
}
