function parseVersionPart(part: string) {
  return Number.parseInt(part.replace(/\D.*/, ""), 10) || 0;
}

export function isNpmVersionGreater(candidate: string, current: string) {
  const candidateParts = candidate.split(".").map(parseVersionPart);
  const currentParts = current.split(".").map(parseVersionPart);
  const length = Math.max(candidateParts.length, currentParts.length);

  for (let index = 0; index < length; index += 1) {
    const candidatePart = candidateParts[index] ?? 0;
    const currentPart = currentParts[index] ?? 0;

    if (candidatePart > currentPart) {
      return true;
    }

    if (candidatePart < currentPart) {
      return false;
    }
  }

  return false;
}
