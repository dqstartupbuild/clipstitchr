export function getNativeWindowAutomationIsAvailable(platform = process.platform) {
  return platform === "darwin";
}
