export function readDemoAutoStepCount(value?: string) {
  const count = Number.parseInt(value ?? "5", 10);

  if (!Number.isFinite(count)) {
    return 5;
  }

  return Math.min(8, Math.max(3, count));
}
