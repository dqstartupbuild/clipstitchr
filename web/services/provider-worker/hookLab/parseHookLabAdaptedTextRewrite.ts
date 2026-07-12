import { getCliprJsonText } from "@/lib/clipstitchr/server/getCliprJsonText";
import { getHookLabParsedObject } from "./getHookLabParsedObject";
import { getHookLabParsedString } from "./getHookLabParsedString";

export function parseHookLabAdaptedTextRewrite(outputText: string) {
  const parsed = getHookLabParsedObject(
    JSON.parse(getCliprJsonText(outputText)) as unknown,
  );

  return getHookLabParsedString(parsed.adaptedHook, "", 240);
}
