export function createStudioReelTempoFilter(tempoFactor: number) {
  const factors: number[] = [];
  let remaining = tempoFactor;
  while (remaining > 2) {
    factors.push(2);
    remaining /= 2;
  }
  while (remaining < 0.5) {
    factors.push(0.5);
    remaining /= 0.5;
  }
  factors.push(remaining);
  return factors.map((factor) => `atempo=${factor.toFixed(8)}`).join(",");
}
