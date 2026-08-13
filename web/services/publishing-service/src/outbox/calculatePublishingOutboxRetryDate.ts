const BASE_DELAY_MILLISECONDS = 5_000;
const MAXIMUM_DELAY_MILLISECONDS = 900_000;

export const calculatePublishingOutboxRetryDate = (
  now: Date,
  deliveryAttempts: number,
): Date => {
  const epochMilliseconds = now.getTime();

  if (
    !Number.isSafeInteger(epochMilliseconds) ||
    !Number.isInteger(deliveryAttempts) ||
    deliveryAttempts < 1
  ) {
    throw new TypeError("A valid retry time and delivery-attempt count are required.");
  }

  const exponent = Math.min(deliveryAttempts - 1, 20);
  const delayMilliseconds = Math.min(
    BASE_DELAY_MILLISECONDS * 2 ** exponent,
    MAXIMUM_DELAY_MILLISECONDS,
  );

  return new Date(epochMilliseconds + delayMilliseconds);
};
