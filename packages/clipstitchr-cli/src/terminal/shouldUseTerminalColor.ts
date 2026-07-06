export function shouldUseTerminalColor() {
  return Boolean(
    process.stdout.isTTY &&
      !process.env.NO_COLOR &&
      process.env.CLIPSTITCHR_PLAIN !== "1",
  );
}
