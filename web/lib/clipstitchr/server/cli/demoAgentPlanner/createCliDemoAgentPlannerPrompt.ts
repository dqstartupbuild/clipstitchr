import type { CliDemoAgentPlanRequest } from "@/lib/clipstitchr/server/cli/demoAgentPlanner/CliDemoAgentPlanRequest";

export function createCliDemoAgentPlannerPrompt(
  request: CliDemoAgentPlanRequest,
) {
  return JSON.stringify({
    allowedActionShape: {
      click:
        '{ "type": "click", "stepId": "...", "target": { "role": "button|link|checkbox|combobox|textbox|menuitem|tab", "name": "..." }, "reason": "..." }',
      finishStep: '{ "type": "finishStep", "stepId": "...", "reason": "..." }',
      navigate: '{ "type": "navigate", "path": "/allowed-local-path" }',
      scroll:
        '{ "type": "scroll", "stepId": "...", "direction": "down", "reason": "..." }',
      screenshot: '{ "type": "screenshot", "stepId": "..." }',
      stop: '{ "type": "stop", "reason": "..." }',
      type:
        '{ "type": "type", "target": { "label": "..." }, "valueText": "safe demo text" }',
      uploadFile:
        '{ "type": "uploadFile", "target": { "label": "..." }, "fileKey": "approved-file-key" }',
      waitFor:
        '{ "type": "waitFor", "visibleText": "...", "timeoutMs": 5000 }',
    },
    appContext: request.appContext,
    approvedTestValueKeys: request.approvedTestValueKeys,
    approvedUploadFileKeys: request.approvedUploadFileKeys,
    attemptedActionKeys: request.attemptedActionKeys,
    attemptedActionKeyRules: [
      "Never return an action whose key already appears in attemptedActionKeys.",
      "A screenshot action key is screenshot:<stepId>.",
      "A click action key is click:<role>:<name>.",
      "A finishStep action key is finishStep:<stepId>.",
      "If screenshot:<stepId> was already attempted and the current screen satisfies a show, review, point-out, or highlight-style step, return finishStep.",
      "If screenshot:<stepId> was already attempted and the current screen does not satisfy the step, choose a visible click, scroll toward the needed field or section, navigate to an allowed local path, wait for visible text, or stop.",
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
    typingRules: [
      "Typing is allowed for safe demo text in local app fields.",
      "Use valueText when the step needs new demo content and approvedTestValueKeys does not already provide an exact reusable value.",
      "Use valueKey only when an approved key clearly matches the requested field.",
      "Never type passwords, API keys, billing details, payment details, real customer data, or anything that matches blocked policy language.",
    ],
    workflowContextRules: [
      "Use appContext.workflowHints as source-derived hints for what this app can actually do.",
      "Map abstract user wording through appContext featureLabels, actions, inputs, and buttons before choosing a route or field.",
      "Current observation is still the authority: click and type only visible controls from observation.",
      "Click target names must come from observation.buttons or observation.links exactly; appContext cannot supply a click target unless the same label is currently visible.",
      "Type target labels must match a visible observation.inputs label or name.",
      "If step.label is Open followed by a local path like /dashboard/stitchr, return a navigate action to that exact path unless observation.url is already on that path.",
      "If the step names a field, picker, section, or button that is not in observation but observation.canScrollDown is true, return one scroll down action before stopping or guessing.",
      "For steps that say Type X into FIELD, return one type action with target.label set to FIELD and valueText set to X. Do not split focusing the field from typing the value.",
      "For Stitchr normal mode goals, click the visible Normal mode button before selecting clips or generating a stitch.",
      "For normal Stitchr clip selection, use the visible Search clip picker videos input and clip cards after scrolling; do not click text-style controls like Any or labels like Hook.",
      "When a step says add, save, create, or update something, match the noun in the step to appContext inputs first, then use a visible matching input from observation.",
      "If a matching input is visible, type safe demo text with valueText unless the step requires private, credential, billing, or real customer data.",
      "For Hook Lab requests to add new hooks or hooks to learn from, type safe examples into the visible Hooks to learn from input, then click a visible Save Hook Lab button.",
      "Do not click Accept, Reject, Copy, Save as winner, or similar history feedback controls unless the guide explicitly asks to act on existing items.",
      "Prefer exact labels from observation and appContext over generic controls such as Open, Menu, or Profile.",
    ],
    observation: request.observation,
    step: request.step,
  });
}
