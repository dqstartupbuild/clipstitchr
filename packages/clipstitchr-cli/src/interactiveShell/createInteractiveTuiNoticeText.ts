import type { InteractiveShellNotice } from "./InteractiveShellNotice.js";

export function createInteractiveTuiNoticeText(
  notice: InteractiveShellNotice | undefined,
) {
  if (!notice) {
    return "Ready: Pick an action or type a slash command.";
  }

  if (notice.kind === "error") {
    return `Needs attention: ${notice.message}`;
  }

  if (notice.kind === "success") {
    return `Done: ${notice.message}`;
  }

  return notice.message;
}
