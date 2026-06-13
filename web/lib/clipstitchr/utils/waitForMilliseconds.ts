export async function waitForMilliseconds(milliseconds: number) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}
