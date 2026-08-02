export const createPublishingWorkflowRetryDate = (
  now: Date,
  seconds: number,
): Date => {
  if (
    !Number.isSafeInteger(now.getTime()) ||
    !Number.isFinite(seconds) ||
    seconds < 1 ||
    seconds > 3_600
  ) {
    throw new TypeError("Publishing workflow retry timing is invalid.");
  }

  return new Date(now.getTime() + Math.ceil(seconds * 1_000));
};
