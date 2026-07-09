import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import { logInfo } from "../terminal/logInfo.js";
import type { InteractiveShellMenu } from "./InteractiveShellMenu.js";
import type { InteractiveShellServices } from "./InteractiveShellServices.js";
import type { InteractiveShellTransition } from "./InteractiveShellTransition.js";
import { dispatchDemoSlashCommand } from "./dispatchDemoSlashCommand.js";
import { dispatchNativeSlashCommand } from "./dispatchNativeSlashCommand.js";
import { dispatchProductsSlashCommand } from "./dispatchProductsSlashCommand.js";
import { dispatchQueueSlashCommand } from "./dispatchQueueSlashCommand.js";
import { dispatchStitchrSlashCommand } from "./dispatchStitchrSlashCommand.js";
import { dispatchSwiprSlashCommand } from "./dispatchSwiprSlashCommand.js";
import { getSlashCommandGlobalOptions } from "./getSlashCommandGlobalOptions.js";
import { parseSlashCommandLine } from "./parseSlashCommandLine.js";
import { parseSlashCommandOptions } from "./parseSlashCommandOptions.js";

export async function dispatchSlashCommand(input: {
  commandLine: string;
  currentMenu: InteractiveShellMenu;
  options: CliGlobalOptions;
  services: InteractiveShellServices;
}): Promise<InteractiveShellTransition> {
  const [command, ...tokens] = parseSlashCommandLine(input.commandLine);

  if (command === "exit" || command === "quit") {
    return { exit: true, menu: input.currentMenu };
  }

  if (command === "main") {
    return { menu: "main" };
  }

  if (command === "help") {
    logInfo(
      "Use commands like /demo manual, /queue stitch --all, /products use product_123, or /status.",
    );
    return { menu: input.currentMenu };
  }

  if (command === "demo") {
    return await dispatchDemoSlashCommand({
      options: input.options,
      services: input.services,
      tokens,
    });
  }

  if (command === "queue") {
    return await dispatchQueueSlashCommand({
      options: input.options,
      services: input.services,
      tokens,
    });
  }

  if (command === "products") {
    return await dispatchProductsSlashCommand({
      options: input.options,
      services: input.services,
      tokens,
    });
  }

  if (command === "native") {
    return await dispatchNativeSlashCommand({
      _options: input.options,
      services: input.services,
      tokens,
    });
  }

  if (command === "stitchr") {
    return await dispatchStitchrSlashCommand({
      options: input.options,
      services: input.services,
      tokens,
    });
  }

  if (command === "swipr") {
    return await dispatchSwiprSlashCommand({
      options: input.options,
      services: input.services,
      tokens,
    });
  }

  if (command === "status") {
    parseSlashCommandOptions({ tokens });
    await input.services.runStatus();
    return { menu: input.currentMenu };
  }

  if (command === "doctor") {
    parseSlashCommandOptions({ tokens });
    await input.services.runDoctor();
    return { menu: input.currentMenu };
  }

  if (command === "update") {
    parseSlashCommandOptions({ tokens });
    await input.services.runUpdate();
    return { menu: input.currentMenu };
  }

  if (command === "link" || command === "init") {
    const parsed = parseSlashCommandOptions({ tokens });
    await input.services.runLink(
      getSlashCommandGlobalOptions({ parsed, shellOptions: input.options }),
    );
    return { menu: "account" };
  }

  if (command === "login") {
    const parsed = parseSlashCommandOptions({ tokens });
    await input.services.runLogin(
      getSlashCommandGlobalOptions({ parsed, shellOptions: input.options }),
    );
    return { menu: "account" };
  }

  if (command === "logout") {
    parseSlashCommandOptions({ tokens });
    await input.services.runLogout();
    return { menu: "account" };
  }

  if (command === "unlink") {
    parseSlashCommandOptions({ tokens });
    await input.services.runUnlink();
    return { menu: "account" };
  }

  throw new Error(`Unknown slash command: /${command}.`);
}
