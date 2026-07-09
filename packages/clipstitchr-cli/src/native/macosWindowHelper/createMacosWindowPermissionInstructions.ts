export function createMacosWindowPermissionInstructions() {
  return [
    "macOS needs permission before ClipStitchr can control a window.",
    "",
    "Open System Settings > Privacy & Security.",
    "In Screen Recording, enable the terminal app running clipstitchr and macos-window-helper if it appears.",
    "In Accessibility, enable the terminal app running clipstitchr and macos-window-helper if it appears.",
    "Quit and reopen the terminal after changing either permission, then run the command again.",
  ].join("\n");
}
