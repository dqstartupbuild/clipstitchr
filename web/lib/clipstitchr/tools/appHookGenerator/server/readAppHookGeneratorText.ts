import { AppHookGeneratorInputError } from "@/lib/clipstitchr/tools/appHookGenerator/server/AppHookGeneratorInputError";

export function readAppHookGeneratorText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    throw new AppHookGeneratorInputError();
  }

  const text = value.trim().replace(/\s+/g, " ");

  if (
    text.length < 2 ||
    text.length > maxLength ||
    text.includes("{{") ||
    text.includes("}}")
  ) {
    throw new AppHookGeneratorInputError();
  }

  return text;
}
