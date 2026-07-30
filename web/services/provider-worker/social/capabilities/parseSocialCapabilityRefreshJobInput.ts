export function parseSocialCapabilityRefreshJobInput(inputSnapshotJson: string) {
  const parsed = JSON.parse(inputSnapshotJson) as { accountId?: unknown };

  if (typeof parsed.accountId !== "string" || !parsed.accountId.trim()) {
    throw new Error("Social capability job input is invalid.");
  }

  return { accountId: parsed.accountId.trim() };
}
