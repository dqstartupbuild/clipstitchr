function capitalizeFirstCharacter(text: string) {
  return text ? `${text[0].toUpperCase()}${text.slice(1)}` : text;
}

function getSingleEmDashReplacement(left: string, right: string) {
  if (
    /^(?:and|but|yet|so|because|although|though|while|when|whenever|until|unless|if|after|before|without)\b/i.test(
      right,
    )
  ) {
    return `${left}, ${right}`;
  }

  if (/^(?:a|an|the|this|that|these|those|what|why|how)\b/i.test(right)) {
    return `${left}: ${right}`;
  }

  return `${left}. ${capitalizeFirstCharacter(right)}`;
}

export function normalizeGeneratedTextPunctuation(text: string) {
  const withoutParentheticalEmDashes = text.replace(
    /\s*\u2014\s*([^\u2014\n]+?)\s*\u2014\s*/g,
    ", $1, ",
  );

  return withoutParentheticalEmDashes
    .split("\n")
    .map((line) => {
      let normalizedLine = line;

      while (normalizedLine.includes("—")) {
        const dashIndex = normalizedLine.indexOf("—");
        const left = normalizedLine.slice(0, dashIndex).trimEnd();
        const right = normalizedLine.slice(dashIndex + 1).trimStart();

        normalizedLine = getSingleEmDashReplacement(left, right);
      }

      return normalizedLine;
    })
    .join("\n");
}
