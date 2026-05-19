import { cliprHookStyleOptions } from "@/lib/clipstitchr/resources/clipr/cliprHookStyleOptions";

export function getCliprHookStyleName(styleKey: string | undefined) {
  return (
    cliprHookStyleOptions.find((option) => option.value === styleKey)?.label ??
    "Auto"
  );
}
