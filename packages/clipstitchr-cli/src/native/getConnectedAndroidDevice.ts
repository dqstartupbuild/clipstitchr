import { runNativeCommand } from "./runNativeCommand.js";

export async function getConnectedAndroidDevice() {
  try {
    const output = await runNativeCommand("adb", ["devices", "-l"]);
    const deviceLine = output
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line && !line.startsWith("List of devices") && line.includes(" device "));

    if (!deviceLine) {
      return undefined;
    }

    const [id] = deviceLine.split(/\s+/);
    const model = deviceLine.match(/model:([^\s]+)/)?.[1]?.replace(/_/g, " ");

    return {
      id,
      name: model ?? id,
    };
  } catch {
    return undefined;
  }
}
