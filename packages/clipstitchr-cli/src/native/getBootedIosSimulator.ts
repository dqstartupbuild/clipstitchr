import { runNativeCommand } from "./runNativeCommand.js";

type SimctlDevice = {
  name?: string;
  state?: string;
  udid?: string;
};

type SimctlListDevicesOutput = {
  devices?: Record<string, SimctlDevice[]>;
};

export async function getBootedIosSimulator() {
  if (process.platform !== "darwin") {
    return undefined;
  }

  try {
    const output = await runNativeCommand("xcrun", [
      "simctl",
      "list",
      "devices",
      "booted",
      "--json",
    ]);
    const parsed = JSON.parse(output) as SimctlListDevicesOutput;

    for (const devices of Object.values(parsed.devices ?? {})) {
      const bootedDevice = devices.find((device) => device.state === "Booted");

      if (bootedDevice?.udid) {
        return {
          name: bootedDevice.name ?? "iOS Simulator",
          udid: bootedDevice.udid,
        };
      }
    }
  } catch {
    return undefined;
  }

  return undefined;
}
