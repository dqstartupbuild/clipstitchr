export function getCliprJsonText(outputText: string) {
  const trimmedText = outputText.trim();
  const codeFenceMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (codeFenceMatch?.[1]) {
    return codeFenceMatch[1].trim();
  }

  const objectStart = trimmedText.indexOf("{");

  if (objectStart === -1) {
    return trimmedText;
  }

  let depth = 0;
  let escaped = false;
  let insideString = false;

  for (let index = objectStart; index < trimmedText.length; index += 1) {
    const character = trimmedText[index];

    if (insideString) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        insideString = false;
      }

      continue;
    }

    if (character === '"') {
      insideString = true;
      continue;
    }

    if (character === "{") {
      depth += 1;
      continue;
    }

    if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return trimmedText.slice(objectStart, index + 1);
      }
    }
  }

  return trimmedText.slice(objectStart);
}
