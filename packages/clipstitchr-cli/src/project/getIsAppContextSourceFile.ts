export function getIsAppContextSourceFile(fileName: string) {
  return (
    !/\.test\.[jt]sx?$/.test(fileName) &&
    !/\.spec\.[jt]sx?$/.test(fileName) &&
    /\.(jsx|tsx)$/.test(fileName)
  );
}
