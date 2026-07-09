import type { SlashCommandOptions } from "./SlashCommandOptions.js";
import { toSlashOptionKey } from "./toSlashOptionKey.js";

export function parseSlashCommandOptions(input: {
  booleanOptions?: string[];
  tokens: string[];
  valueOptions?: string[];
}): SlashCommandOptions {
  const booleanOptions = new Set([
    "plain",
    ...(input.booleanOptions ?? []),
  ]);
  const valueOptions = new Set(["api", ...(input.valueOptions ?? [])]);
  const options: SlashCommandOptions["options"] = {};
  const positionals: string[] = [];

  for (let index = 0; index < input.tokens.length; index += 1) {
    const token = input.tokens[index];

    if (!token.startsWith("--")) {
      positionals.push(token);
      continue;
    }

    const rawFlag = token.slice(2);
    const [flagName, inlineValue] = rawFlag.split(/=(.*)/s, 2);
    const negativeBoolean = flagName.startsWith("no-");
    const normalizedFlagName = negativeBoolean ? flagName.slice(3) : flagName;
    const optionKey = toSlashOptionKey(normalizedFlagName);

    if (negativeBoolean) {
      if (
        !booleanOptions.has(normalizedFlagName) &&
        !valueOptions.has(normalizedFlagName)
      ) {
        throw new Error(`Unknown option --${flagName}.`);
      }

      options[optionKey] = false;
      continue;
    }

    if (valueOptions.has(flagName)) {
      const value = inlineValue ?? input.tokens[index + 1];

      if (!value || value.startsWith("--")) {
        throw new Error(`Add a value for --${flagName}.`);
      }

      options[optionKey] = value;

      if (inlineValue === undefined) {
        index += 1;
      }
      continue;
    }

    if (booleanOptions.has(flagName)) {
      options[optionKey] =
        inlineValue === undefined ? true : inlineValue !== "false";
      continue;
    }

    throw new Error(`Unknown option --${flagName}.`);
  }

  return { options, positionals };
}
