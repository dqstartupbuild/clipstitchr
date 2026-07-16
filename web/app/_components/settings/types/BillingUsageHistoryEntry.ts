export type BillingUsageHistoryEntry = {
  availableDelta: number;
  consumedDelta: number;
  createdAt: string;
  entryType: string;
  operation: string;
  quantity: number;
  reservedDelta: number;
  resource: string;
};
