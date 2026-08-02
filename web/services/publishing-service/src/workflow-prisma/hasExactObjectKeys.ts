export const hasExactObjectKeys = (
  value: Readonly<Record<string, unknown>>,
  expectedKeys: readonly string[],
): boolean => {
  const keys = Object.keys(value);

  return (
    keys.length === expectedKeys.length &&
    expectedKeys.every((key) => Object.hasOwn(value, key))
  );
};
