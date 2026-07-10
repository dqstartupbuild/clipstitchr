import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import type { QueueMenuAction } from "./QueueMenuAction.js";
import type { QueueMenuServices } from "./QueueMenuServices.js";
import type { QueueMenuTextReader } from "./QueueMenuTextReader.js";

export async function runQueueMenuAction(input: {
  action: QueueMenuAction;
  options: CliGlobalOptions;
  readText: QueueMenuTextReader;
  services: QueueMenuServices;
}) {
  if (input.action === "list") {
    await input.services.runList(input.options);
    return;
  }

  if (input.action === "stitch-latest") {
    await input.services.runStitch(undefined, input.options);
    return;
  }

  if (input.action === "stitch-all") {
    await input.services.runStitch(undefined, {
      ...input.options,
      all: true,
    });
    return;
  }

  if (input.action === "swipe-latest") {
    await input.services.runSwipe(undefined, input.options);
    return;
  }

  if (input.action === "swipe-all") {
    await input.services.runSwipe(undefined, {
      ...input.options,
      all: true,
    });
    return;
  }

  if (input.action === "stitch-id") {
    await input.services.runStitch(
      await input.readText("Stitch ID:"),
      input.options,
    );
    return;
  }

  if (input.action === "swipe-id") {
    await input.services.runSwipe(
      await input.readText("Swipe ID:"),
      input.options,
    );
    return;
  }

  if (input.action === "all") {
    await input.services.runAll(input.options);
    return;
  }

  throw new Error(`Unknown queue menu action: ${input.action}.`);
}
