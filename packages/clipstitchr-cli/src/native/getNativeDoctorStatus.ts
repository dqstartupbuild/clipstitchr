import { getBootedIosSimulator } from "./getBootedIosSimulator.js";
import { getConnectedAndroidDevice } from "./getConnectedAndroidDevice.js";
import { isCommandAvailable } from "./isCommandAvailable.js";
import type { NativeDoctorStatus } from "./NativeDoctorStatus.js";

export async function getNativeDoctorStatus(): Promise<NativeDoctorStatus> {
  const [xcrunAvailable, adbAvailable, iosSimulator, androidDevice] =
    await Promise.all([
      isCommandAvailable("xcrun"),
      isCommandAvailable("adb", ["version"]),
      getBootedIosSimulator(),
      getConnectedAndroidDevice(),
    ]);

  return {
    adbAvailable,
    androidDeviceName: androidDevice?.name,
    iosSimulatorName: iosSimulator?.name,
    xcrunAvailable,
  };
}
