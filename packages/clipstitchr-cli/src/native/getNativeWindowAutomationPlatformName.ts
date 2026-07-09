export function getNativeWindowAutomationPlatformName(platform: NodeJS.Platform) {
  if (platform === "win32") {
    return "Windows";
  }

  if (platform === "linux") {
    return "Linux";
  }

  return platform;
}
