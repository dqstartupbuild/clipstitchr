export function parseSlashCommandLine(commandLine: string) {
  const trimmedCommandLine = commandLine.trim();

  if (!trimmedCommandLine.startsWith("/")) {
    throw new Error("Start slash commands with /.");
  }

  const body = trimmedCommandLine.slice(1).trim();

  if (!body) {
    throw new Error("Type a command after /.");
  }

  const tokens: string[] = [];
  let current = "";
  let quote: "'" | "\"" | undefined;

  for (let index = 0; index < body.length; index += 1) {
    const character = body[index];

    if (character === "\\" && index + 1 < body.length) {
      current += body[index + 1];
      index += 1;
      continue;
    }

    if ((character === "'" || character === "\"") && !quote) {
      quote = character;
      continue;
    }

    if (character === quote) {
      quote = undefined;
      continue;
    }

    if (/\s/.test(character) && !quote) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += character;
  }

  if (quote) {
    throw new Error("Close the quote in the slash command.");
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}
