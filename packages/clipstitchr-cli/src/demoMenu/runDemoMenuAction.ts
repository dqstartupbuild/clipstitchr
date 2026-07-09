import type { CliGlobalOptions } from "../commands/CliGlobalOptions.js";
import type { DemoMenuAction } from "./DemoMenuAction.js";
import type { DemoMenuServices } from "./DemoMenuServices.js";
import type { DemoMenuTextReader } from "./DemoMenuTextReader.js";

export async function runDemoMenuAction(input: {
  action: DemoMenuAction;
  options: CliGlobalOptions;
  readText: DemoMenuTextReader;
  services: DemoMenuServices;
}) {
  if (input.action === "manual") {
    await input.services.runManual(input.options);
    return;
  }

  if (input.action === "agent") {
    await input.services.runAgent({
      ...input.options,
      guide: await input.readText("Guide name, ID, or path:"),
    });
    return;
  }

  if (input.action === "guide-create") {
    await input.services.runGuideCreate(input.options);
    return;
  }

  if (input.action === "guide-list") {
    await input.services.runGuideList(input.options);
    return;
  }

  if (input.action === "guide-show") {
    await input.services.runGuideShow(await input.readText("Guide name, ID, or path:"));
    return;
  }

  if (input.action === "guide-edit") {
    await input.services.runGuideEdit(await input.readText("Guide name, ID, or path:"));
    return;
  }

  if (input.action === "guide-delete") {
    await input.services.runGuideDelete(
      await input.readText("Guide name, ID, or path:"),
      input.options,
    );
    return;
  }

  if (input.action === "policy-init") {
    await input.services.runPolicyInit(input.options);
    return;
  }

  if (input.action === "policy-check") {
    await input.services.runPolicyCheck(input.options);
    return;
  }

  if (input.action === "policy-edit") {
    await input.services.runPolicyEdit(input.options);
    return;
  }

  if (input.action === "upload") {
    await input.services.runUpload(
      await input.readText("Demo file path:"),
      input.options,
    );
    return;
  }

  if (input.action === "logs") {
    await input.services.runLogs(
      await input.readText("AI run ID:"),
      input.options,
    );
    return;
  }

  await input.services.runNativeSetup();
}
