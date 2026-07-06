import { input, select } from "@inquirer/prompts";
import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import { runDemoMakeCommand } from "../commands/runDemoMakeCommand.js";
import { runDemoUploadCommand } from "../commands/runDemoUploadCommand.js";
import { runInitCommand } from "../commands/runInitCommand.js";
import { runDoctorCommand } from "../commands/runDoctorCommand.js";

export async function runInteractiveCommand(options: CliGlobalOptions) {
  console.log("Welcome to ClipStitchr");

  const action = await select({
    choices: [
      {
        name: "Make a product demo",
        value: "make",
      },
      {
        name: "Upload an existing demo",
        value: "upload",
      },
      {
        name: "Connect this repo to ClipStitchr",
        value: "init",
      },
      {
        name: "Check settings",
        value: "doctor",
      },
    ],
    message: "What do you want to do?",
  });

  if (action === "make") {
    await runDemoMakeCommand(options);
    return;
  }

  if (action === "upload") {
    const filePath = await input({
      message: "Demo file path:",
    });

    await runDemoUploadCommand(filePath, options);
    return;
  }

  if (action === "init") {
    await runInitCommand(options);
    return;
  }

  await runDoctorCommand();
}
