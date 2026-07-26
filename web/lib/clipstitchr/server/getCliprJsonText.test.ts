import { describe, expect, it } from "vitest";
import { getCliprJsonText } from "@/lib/clipstitchr/server/getCliprJsonText";

describe("getCliprJsonText", () => {
  it("extracts a complete JSON object after visible model analysis", () => {
    expect(
      getCliprJsonText(
        'I will work through this first.\n{"filledHook":"wait, so this works","variablesUsed":{"note":"a } inside a string"}}\nDone.',
      ),
    ).toBe(
      '{"filledHook":"wait, so this works","variablesUsed":{"note":"a } inside a string"}}',
    );
  });

  it("keeps complete fenced JSON behavior", () => {
    expect(getCliprJsonText('Notes\n```json\n{"filledHook":"Hook"}\n```')).toBe(
      '{"filledHook":"Hook"}',
    );
  });

  it("removes prose before an unfinished JSON object so parsing can retry", () => {
    expect(
      getCliprJsonText(
        'I will work through this first.\n{"filledHook":"unfinished',
      ),
    ).toBe('{"filledHook":"unfinished');
  });
});
