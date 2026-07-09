import type { InteractiveShellMenu } from "./InteractiveShellMenu.js";

export type InteractiveShellTransition = {
  exit?: boolean;
  menu: InteractiveShellMenu;
};
