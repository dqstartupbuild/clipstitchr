import { getNativeWindowAutomationPlatformName } from "./getNativeWindowAutomationPlatformName.js";

export function createNativeWindowAutomationUnavailableMessage(
  platform: NodeJS.Platform,
) {
  return `Native visible-window automation is not available on ${getNativeWindowAutomationPlatformName(platform)} yet. Browser demos still work. Manual Android recording can still use adb screenrecord when Android tools are installed. Today, AI control of visible iOS Simulator, iPhone Mirroring, Android emulator, and desktop app windows uses the macOS window helper. Future adapters are planned for windows-window and android-adb.`;
}
