export function readDemoWalkthroughGuideStepCountInput(value: string) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) {
    return 5;
  }

  return Math.min(8, Math.max(3, parsed));
}
