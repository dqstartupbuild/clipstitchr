import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import { clipstitchrCliDescription } from "../config/clipstitchrCliDescription.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import type { InteractiveShellMenu } from "./InteractiveShellMenu.js";
import type { InteractiveShellNotice } from "./InteractiveShellNotice.js";
import { createInteractiveTuiFrame } from "./createInteractiveTuiFrame.js";
import { getInteractiveShellMenuTitle } from "./getInteractiveShellMenuTitle.js";
import { getInteractiveTuiIsSupported } from "./getInteractiveTuiIsSupported.js";

export function logInteractiveShellMenuHeader(input: {
  menu: InteractiveShellMenu;
  notice?: InteractiveShellNotice;
  options: CliGlobalOptions;
}) {
  if (
    getInteractiveTuiIsSupported({
      plain: input.options.plain,
    })
  ) {
    console.log(
      createInteractiveTuiFrame({
        menu: input.menu,
        notice: input.notice,
      }),
    );
    console.log("");
    return;
  }

  logBrandHeader(
    input.menu === "main"
      ? clipstitchrCliDescription
      : getInteractiveShellMenuTitle(input.menu),
  );
}
