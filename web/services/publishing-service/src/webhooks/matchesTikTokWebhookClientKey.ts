import { timingSafeEqual } from "node:crypto";

export const matchesTikTokWebhookClientKey = (
  actual: string,
  expected: string,
): boolean => {
  const actualBytes = Buffer.from(actual, "utf8");
  const expectedBytes = Buffer.from(expected, "utf8");
  return (
    actualBytes.byteLength === expectedBytes.byteLength &&
    timingSafeEqual(actualBytes, expectedBytes)
  );
};
