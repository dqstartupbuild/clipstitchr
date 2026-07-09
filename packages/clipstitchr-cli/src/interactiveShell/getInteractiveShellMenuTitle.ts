import type { InteractiveShellMenu } from "./InteractiveShellMenu.js";

export function getInteractiveShellMenuTitle(menu: InteractiveShellMenu) {
  if (menu === "account") {
    return "Account and repo";
  }

  if (menu === "demo") {
    return "Demo";
  }

  if (menu === "native") {
    return "Native";
  }

  if (menu === "products") {
    return "Products";
  }

  if (menu === "queue") {
    return "Queue";
  }

  return "Main menu";
}
