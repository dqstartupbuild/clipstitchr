import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import type { DemoMenuAction } from "../demoMenu/DemoMenuAction.js";
import { runDemoMenuAction } from "../demoMenu/runDemoMenuAction.js";
import { getInteractiveShellNavigationTransition } from "../interactiveShell/getInteractiveShellNavigationTransition.js";
import { getIsInteractiveShellNavigationAction } from "../interactiveShell/getIsInteractiveShellNavigationAction.js";
import type { InteractiveShellMenu } from "../interactiveShell/InteractiveShellMenu.js";
import type { InteractiveShellPrompts } from "../interactiveShell/InteractiveShellPrompts.js";
import type { InteractiveShellServices } from "../interactiveShell/InteractiveShellServices.js";
import type { InteractiveShellTransition } from "../interactiveShell/InteractiveShellTransition.js";
import type { ProductsMenuAction } from "../productsMenu/ProductsMenuAction.js";
import { runProductsMenuAction } from "../productsMenu/runProductsMenuAction.js";
import type { QueueMenuAction } from "../queueMenu/QueueMenuAction.js";
import { runQueueMenuAction } from "../queueMenu/runQueueMenuAction.js";

export async function runInteractiveTuiMenuAction(input: {
  action: string;
  menu: InteractiveShellMenu;
  options: CliGlobalOptions;
  prompts: InteractiveShellPrompts;
  services: InteractiveShellServices;
}): Promise<InteractiveShellTransition> {
  if (getIsInteractiveShellNavigationAction(input.action)) {
    return getInteractiveShellNavigationTransition({
      action: input.action,
      backMenu: "main",
      currentMenu: input.menu,
    });
  }

  if (input.menu === "main") {
    if (
      input.action === "demo" ||
      input.action === "products" ||
      input.action === "queue" ||
      input.action === "native" ||
      input.action === "account"
    ) {
      return { menu: input.action };
    }

    if (input.action === "stitchr-new") {
      await input.services.runStitchrNew(input.options);
    } else if (input.action === "swipr-new") {
      await input.services.runSwiprNew(input.options);
    } else if (input.action === "link") {
      await input.services.runLink(input.options);
    } else if (input.action === "login") {
      await input.services.runLogin(input.options);
    } else if (input.action === "status") {
      await input.services.runStatus();
    } else if (input.action === "doctor") {
      await input.services.runDoctor();
    } else {
      await input.services.runUpdate();
    }

    return { menu: "main" };
  }

  if (input.menu === "demo") {
    await runDemoMenuAction({
      action: input.action as DemoMenuAction,
      options: input.options,
      readText: input.prompts.input,
      services: input.services.demo,
    });
    return { menu: "demo" };
  }

  if (input.menu === "products") {
    await runProductsMenuAction({
      action: input.action as ProductsMenuAction,
      options: input.options,
      services: input.services.products,
    });
    return { menu: "products" };
  }

  if (input.menu === "queue") {
    await runQueueMenuAction({
      action: input.action as QueueMenuAction,
      options: input.options,
      readText: input.prompts.input,
      services: input.services.queue,
    });
    return { menu: "queue" };
  }

  if (input.menu === "native") {
    if (input.action === "native-init") {
      await input.services.runNativeInit();
    } else {
      await input.services.runNativeCheck();
    }
    return { menu: "native" };
  }

  if (input.action === "native") {
    return { menu: "native" };
  }

  if (input.action === "link") {
    await input.services.runLink(input.options);
  } else if (input.action === "login") {
    await input.services.runLogin(input.options);
  } else if (input.action === "logout") {
    await input.services.runLogout();
  } else if (input.action === "unlink") {
    await input.services.runUnlink();
  } else if (input.action === "doctor") {
    await input.services.runDoctor();
  } else if (input.action === "update") {
    await input.services.runUpdate();
  } else {
    await input.services.runStatus();
  }

  return { menu: "account" };
}
