import type { CliDemoAgentPlanRequest } from "@/lib/clipstitchr/server/cli/demoAgentPlanner/CliDemoAgentPlanRequest";

export function createCliDemoAgentPlannerPrompt(
  request: CliDemoAgentPlanRequest,
) {
  return JSON.stringify({
    allowedActionShape: {
      chooseFileFromLibrary:
        '{ "type": "chooseFileFromLibrary", "mediaType": "any|avatar|demo|stitch|template|ugc", "searchText": "optional visible file name or query", "reason": "..." }',
      chooseMenuItem:
        '{ "type": "chooseMenuItem", "name": "visible menu item name", "reason": "..." }',
      clearField:
        '{ "type": "clearField", "target": { "label": "visible field label" }, "reason": "..." }',
      click:
        '{ "type": "click", "stepId": "...", "target": { "role": "button|link|checkbox|combobox|textbox|menuitem|tab", "name": "..." }, "reason": "..." }',
      clickCardAction:
        '{ "type": "clickCardAction", "cardText": "visible card text", "actionName": "visible button name in that card", "reason": "..." }',
      clickFirstMatching:
        '{ "type": "clickFirstMatching", "target": { "role": "button|link|checkbox|combobox|textbox|menuitem|tab", "name": "..." }, "reason": "..." }',
      closeDialog: '{ "type": "closeDialog", "reason": "..." }',
      copyToClipboard:
        '{ "type": "copyToClipboard", "target": { "role": "button", "name": "Copy" }, "reason": "..." }',
      downloadFile:
        '{ "type": "downloadFile", "target": { "role": "button|link", "name": "Download" }, "reason": "..." }',
      dragAndDrop:
        '{ "type": "dragAndDrop", "sourceText": "visible draggable text", "targetText": "visible drop target text", "reason": "..." }',
      finishStep: '{ "type": "finishStep", "stepId": "...", "reason": "..." }',
      navigate: '{ "type": "navigate", "path": "/allowed-local-path" }',
      openMenu:
        '{ "type": "openMenu", "target": { "role": "button", "name": "visible menu button" }, "reason": "..." }',
      playPauseMedia:
        '{ "type": "playPauseMedia", "mediaAction": "play|pause", "targetLabel": "optional visible media button label", "reason": "..." }',
      pressKey:
        '{ "type": "pressKey", "key": "ArrowDown|ArrowLeft|ArrowRight|ArrowUp|Backspace|Enter|Escape|Space|Tab", "target": { "label": "optional visible field label" }, "reason": "..." }',
      scroll:
        '{ "type": "scroll", "stepId": "...", "direction": "down", "reason": "..." }',
      scrollToControl:
        '{ "type": "scrollToControl", "target": { "role": "button|link|checkbox|combobox|textbox|menuitem|tab", "name": "..." }, "reason": "..." }',
      scrollToText:
        '{ "type": "scrollToText", "text": "visible text to bring into view", "reason": "..." }',
      screenshot: '{ "type": "screenshot", "stepId": "..." }',
      seekMedia:
        '{ "type": "seekMedia", "seconds": 12, "targetLabel": "optional visible media label", "reason": "..." }',
      selectOption:
        '{ "type": "selectOption", "target": { "label": "visible select label" }, "optionLabel": "visible option label", "reason": "..." }',
      setMode: '{ "type": "setMode", "mode": "visible mode name" }',
      setSlider:
        '{ "type": "setSlider", "target": { "label": "visible slider label" }, "value": 50, "reason": "..." }',
      stop: '{ "type": "stop", "reason": "..." }',
      toggle:
        '{ "type": "toggle", "target": { "label": "visible toggle label" }, "checked": true, "reason": "..." }',
      type:
        '{ "type": "type", "target": { "label": "..." }, "valueText": "safe demo text" }',
      uploadFile:
        '{ "type": "uploadFile", "target": { "label": "..." }, "fileKey": "approved-file-key" }',
      waitFor:
        '{ "type": "waitFor", "visibleText": "...", "timeoutMs": 5000 }',
      waitForElementEnabled:
        '{ "type": "waitForElementEnabled", "target": { "role": "button", "name": "..." }, "timeoutMs": 5000, "reason": "..." }',
      waitForJob:
        '{ "type": "waitForJob", "visibleText": "result text", "statusText": "optional progress text", "timeoutMs": 30000, "reason": "..." }',
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
      "Every action type has a key made from its visible target text or primary value; do not repeat the same target/value pair after it failed.",
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
      "Type, clearField, selectOption, toggle, and setSlider labels must match a visible observation.inputs label or name.",
      "Prefer semantic actions when they directly match the UI task: selectOption for selects, toggle for switches, setMode for modes, openMenu and chooseMenuItem for menus, downloadFile for downloads, copyToClipboard for copy buttons, and waitForJob for generation or processing.",
      "Use waitForElementEnabled when the right button is visible but disabled while the app finishes loading or validating inputs.",
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
