export function rotateLazyReelValues<T>(values: readonly T[], seed: number, count: number) {
  const selected: T[] = [];
  const used = new Set<number>();

  for (let index = 0; selected.length < Math.min(count, values.length); index += 1) {
    const valueIndex = (seed + index * 7) % values.length;
    if (!used.has(valueIndex)) {
      used.add(valueIndex);
      selected.push(values[valueIndex]);
    }
  }

  return selected;
}
