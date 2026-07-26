export function getUgcDiscoveryHookCoordinates(templateId: string) {
  const match = templateId.match(/^UGD-(\d{3})$/);
  const templateNumber = match?.[1] ? Number(match[1]) : Number.NaN;

  if (
    !Number.isInteger(templateNumber) ||
    templateNumber < 1 ||
    templateNumber > 300
  ) {
    return null;
  }

  const zeroBasedIndex = templateNumber - 1;

  return {
    familyIndex: Math.floor(zeroBasedIndex / 100),
    openerIndex: Math.floor((zeroBasedIndex % 100) / 10),
    patternIndex: zeroBasedIndex % 10,
  };
}
