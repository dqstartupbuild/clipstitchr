import type { CliDemoAgentPlanRequest } from "@/lib/clipstitchr/server/cli/demoAgentPlanner/CliDemoAgentPlanRequest";

export function createCliDemoAgentPlannerRepairPrompt({
  invalidOutputText,
  parseErrorMessage,
  request,
}: {
  invalidOutputText: string;
  parseErrorMessage: string;
  request: CliDemoAgentPlanRequest;
}) {
  return JSON.stringify(
    {
      allowedClickRoles: [
        "button",
        "checkbox",
        "combobox",
        "link",
        "menuitem",
        "tab",
        "textbox",
      ],
      error: parseErrorMessage,
      invalidOutputText: invalidOutputText.slice(0, 2000),
      instruction:
        "Repair the invalid planner output. Return exactly one valid JSON action object and no prose.",
      rules: [
        "Use only action types: navigate, click, type, uploadFile, waitFor, scroll, selectOption, pressKey, clearField, scrollToText, scrollToControl, clickFirstMatching, clickCardAction, waitForJob, waitForElementEnabled, chooseFileFromLibrary, toggle, setMode, openMenu, chooseMenuItem, closeDialog, dragAndDrop, setSlider, playPauseMedia, seekMedia, downloadFile, copyToClipboard, screenshot, finishStep, stop.",
        "Use only allowedClickRoles for click.target.role, or omit role and use label/name/text.",
        "For route-opening steps like Open /dashboard/stitchr, return navigate with that exact local path.",
        "For typing steps, return type with target.label and valueText in the same action.",
        "Use semantic action shapes for selects, toggles, menus, modes, sliders, downloads, copy buttons, media controls, and drag/drop.",
        "If the needed control is likely below the current viewport and observation.canScrollDown is true, return { \"type\": \"scroll\", \"direction\": \"down\" }.",
        "Use the supplied observation as the authority for visible controls.",
      ],
      guide: request.guide,
      observation: request.observation,
      step: request.step,
    },
    null,
    2,
  );
}
