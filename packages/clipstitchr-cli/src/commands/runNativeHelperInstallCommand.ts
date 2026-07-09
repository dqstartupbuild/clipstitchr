import type { NativeInitCommandOptions } from "./NativeInitCommandOptions.js";
import { runNativeInitCommand } from "./runNativeInitCommand.js";

export async function runNativeHelperInstallCommand(
  options: NativeInitCommandOptions = {},
) {
  await runNativeInitCommand(options);
}
