import type { InteractiveShellMenu } from "./InteractiveShellMenu.js";
import type { InteractiveShellNotice } from "./InteractiveShellNotice.js";

export type InteractiveShellTransition = {
  exit?: boolean;
  menu: InteractiveShellMenu;
  notice?: InteractiveShellNotice;
};
