import { input, select } from "@inquirer/prompts";
import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import { runDemoMakeCommand } from "../commands/runDemoMakeCommand.js";
import { runDemoUploadCommand } from "../commands/runDemoUploadCommand.js";
import { runInitCommand } from "../commands/runInitCommand.js";
import { runDoctorCommand } from "../commands/runDoctorCommand.js";
import { runQueueStitchCommand } from "../commands/runQueueStitchCommand.js";
import { runStitchrBatchCommand } from "../commands/runStitchrBatchCommand.js";
import { runSwiprBatchCommand } from "../commands/runSwiprBatchCommand.js";
import { clipstitchrCliDescription } from "../config/clipstitchrCliDescription.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";

export async function runInteractiveCommand(options: CliGlobalOptions) {
  logBrandHeader(clipstitchrCliDescription);

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
        name: "Run a Stitchr batch",
        value: "stitchr",
      },
      {
        name: "Run a Swipr batch",
        value: "swipr",
      },
      {
        name: "Add a Stitch to my queue",
        value: "queue",
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

  if (action === "stitchr") {
    await runStitchrBatchCommand(options);
    return;
  }

  if (action === "swipr") {
    await runSwiprBatchCommand(options);
    return;
  }

  if (action === "queue") {
    await runQueueStitchCommand(undefined, options);
    return;
  }

  if (action === "init") {
    await runInitCommand(options);
    return;
  }

  await runDoctorCommand();
}
