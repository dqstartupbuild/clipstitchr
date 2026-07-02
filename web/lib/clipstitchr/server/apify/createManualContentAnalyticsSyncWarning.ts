type CreateManualContentAnalyticsSyncWarningOptions = {
  failedAccountCount: number;
  skippedItemCount: number;
};

export function createManualContentAnalyticsSyncWarning({
  failedAccountCount,
  skippedItemCount,
}: CreateManualContentAnalyticsSyncWarningOptions) {
  if (failedAccountCount <= 0 && skippedItemCount <= 0) {
    return null;
  }

  if (failedAccountCount > 0 && skippedItemCount > 0) {
    return "Some manual posts could not be synced. We kept the posts we could read, and your Post Bridge results are still here.";
  }

  if (failedAccountCount > 0) {
    return "Manual analytics could not sync for some accounts. Your Post Bridge results are still here, and you can try again.";
  }

  return "Some manual posts could not be read. We kept the posts we could read.";
}
