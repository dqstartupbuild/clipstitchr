export const getTikTokPollDelaySeconds = (pollCount: number): number => {
  if (!Number.isInteger(pollCount) || pollCount < 0) {
    throw new TypeError("TikTok poll count is invalid.");
  }

  return Math.min(5 * 2 ** Math.min(pollCount, 4), 60);
};
