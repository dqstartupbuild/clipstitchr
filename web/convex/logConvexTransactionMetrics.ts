type ConvexTransactionMetricsContext = {
  meta?: {
    getTransactionMetrics?: () => Promise<unknown> | unknown;
  };
};

export async function logConvexTransactionMetrics(ctx: unknown, label: string) {
  const getTransactionMetrics = (ctx as ConvexTransactionMetricsContext).meta
    ?.getTransactionMetrics;

  if (!getTransactionMetrics) {
    return;
  }

  try {
    console.info(
      "[convex-transaction-metrics]",
      label,
      JSON.stringify(await getTransactionMetrics()),
    );
  } catch {
    console.info(
      "[convex-transaction-metrics]",
      label,
      await getTransactionMetrics(),
    );
  }
}
