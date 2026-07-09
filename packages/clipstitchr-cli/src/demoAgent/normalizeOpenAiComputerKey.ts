const openAiComputerKeyMap: Record<string, string> = {
  ALT: "Alt",
  ARROWDOWN: "ArrowDown",
  ARROWLEFT: "ArrowLeft",
  ARROWRIGHT: "ArrowRight",
  ARROWUP: "ArrowUp",
  BACKSPACE: "Backspace",
  CMD: "Meta",
  COMMAND: "Meta",
  CONTROL: "Control",
  CTRL: "Control",
  DEL: "Delete",
  DELETE: "Delete",
  DOWN: "ArrowDown",
  ENTER: "Enter",
  ESC: "Escape",
  ESCAPE: "Escape",
  LEFT: "ArrowLeft",
  META: "Meta",
  OPTION: "Alt",
  RETURN: "Enter",
  RIGHT: "ArrowRight",
  SHIFT: "Shift",
  SPACE: "Space",
  SPACEBAR: "Space",
  TAB: "Tab",
  UP: "ArrowUp",
};

export function normalizeOpenAiComputerKey(key: string) {
  const trimmedKey = key.trim();

  return openAiComputerKeyMap[trimmedKey.toUpperCase()] ?? trimmedKey;
}
