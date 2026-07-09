import type { InteractiveShellMenu } from "./InteractiveShellMenu.js";
import type { InteractiveShellNotice } from "./InteractiveShellNotice.js";
import { createInteractiveTuiBorder } from "./createInteractiveTuiBorder.js";
import { createInteractiveTuiLine } from "./createInteractiveTuiLine.js";
import { createInteractiveTuiNoticeText } from "./createInteractiveTuiNoticeText.js";
import { getInteractiveShellMenuTitle } from "./getInteractiveShellMenuTitle.js";

export function createInteractiveTuiFrame(input: {
  columns?: number;
  menu: InteractiveShellMenu;
  notice?: InteractiveShellNotice;
}) {
  const terminalColumns = input.columns ?? process.stdout.columns ?? 80;
  const width = Math.max(56, Math.min(terminalColumns, 92));
  const border = createInteractiveTuiBorder(width);
  const menuTitle = getInteractiveShellMenuTitle(input.menu);
  const lines = [
    border,
    createInteractiveTuiLine({
      text: "ClipStitchr  Interactive",
      width,
    }),
    createInteractiveTuiLine({
      text: `Menu: ${menuTitle}`,
      width,
    }),
    border,
    createInteractiveTuiLine({
      text: createInteractiveTuiNoticeText(input.notice),
      width,
    }),
    createInteractiveTuiLine({
      text: "Keys: Use arrows to move, Enter to choose, Ctrl+C to exit.",
      width,
    }),
    createInteractiveTuiLine({
      text: "Slash: /demo manual, /queue stitch --all, /products use product_123",
      width,
    }),
    createInteractiveTuiLine({
      text: "Navigation: Back | Main menu | Exit | Type a slash command",
      width,
    }),
    border,
  ];

  return lines.join("\n");
}
