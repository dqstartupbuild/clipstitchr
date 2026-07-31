export function parseSocialAnalyticsRefreshJobInput(inputSnapshotJson: string) {
  const parsed = JSON.parse(inputSnapshotJson) as {
    refreshRunId?: unknown;
  };

  if (
    typeof parsed.refreshRunId !== "string" ||
    !parsed.refreshRunId.trim()
  ) {
    throw new Error("Social analytics job input is invalid.");
  }

  return { refreshRunId: parsed.refreshRunId.trim() };
}
