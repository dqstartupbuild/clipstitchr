export const readPublishingWorkflowNow = (now: () => Date): Date => {
  const value = now();

  if (!Number.isSafeInteger(value.getTime())) {
    throw new TypeError("The publishing workflow clock returned an invalid date.");
  }

  return value;
};
