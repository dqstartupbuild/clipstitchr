import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import type { DemoMenuServices } from "../demoMenu/DemoMenuServices.js";
import type { DemoMenuTextReader } from "../demoMenu/DemoMenuTextReader.js";
import { runDemoMenuAction } from "../demoMenu/runDemoMenuAction.js";
import type { DemoCreationMode } from "./DemoCreationMode.js";

export async function runDemoCreationMode(input: {
  mode: DemoCreationMode;
  options: CliGlobalOptions;
  readText: DemoMenuTextReader;
  services: DemoMenuServices;
}) {
  await runDemoMenuAction({
    action: input.mode,
    options: input.options,
    readText: input.readText,
    services: input.services,
  });
}
