export function getQuickEditMergedDetectorText(first?: string, second?: string) {
  if (!first) {
    return second;
  }

  if (!second || first === second) {
    return first;
  }

  return `${first} ${second}`.slice(0, 180);
}
