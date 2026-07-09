import { input, select } from "@inquirer/prompts";
import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import { runDemoUploadCommand } from "../commands/runDemoUploadCommand.js";
import { runInitCommand } from "../commands/runInitCommand.js";
import { runDoctorCommand } from "../commands/runDoctorCommand.js";
import { runQueueStitchCommand } from "../commands/runQueueStitchCommand.js";
import { runStitchrBatchCommand } from "../commands/runStitchrBatchCommand.js";
import { runSwiprBatchCommand } from "../commands/runSwiprBatchCommand.js";
import { clipstitchrCliDescription } from "../config/clipstitchrCliDescription.js";
import { createDemoMenuServices } from "../demoMenu/createDemoMenuServices.js";
import { logBrandHeader } from "../terminal/logBrandHeader.js";
import { logWarning } from "../terminal/logWarning.js";
import { createDemoCreationChoices } from "./createDemoCreationChoices.js";
import { runDemoCreationMode } from "./runDemoCreationMode.js";

export async function runInteractiveCommand(options: CliGlobalOptions) {
  logBrandHeader(clipstitchrCliDescription);

  const action = await select({
    choices: [
      {
        name: "Record a demo",
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
    const mode = await select({
      choices: createDemoCreationChoices(),
      message: "How do you want to record this demo?",
    });

    if (mode === "agent") {
      logWarning(
        "AI recording follows your saved safety policy. Use test accounts for live sites and review the run before upload.",
      );
    }

    await runDemoCreationMode({
      mode,
      options,
      readText: (message) => input({ message }),
      services: createDemoMenuServices(),
    });
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
