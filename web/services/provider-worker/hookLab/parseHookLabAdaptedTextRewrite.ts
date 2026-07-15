import { getCliprJsonText } from "@/lib/clipstitchr/server/getCliprJsonText";
import { getHookLabParsedObject } from "./getHookLabParsedObject";
import { getHookLabParsedString } from "./getHookLabParsedString";
import { sanitizeCliprGeneratedText } from "@/lib/clipstitchr/utils/sanitizeCliprGeneratedText";

export function parseHookLabAdaptedTextRewrite(outputText: string) {
  const parsed = getHookLabParsedObject(
    JSON.parse(getCliprJsonText(outputText)) as unknown,
  );

  return sanitizeCliprGeneratedText(
    getHookLabParsedString(parsed.adaptedHook, "", 240),
    "",
  );
}
