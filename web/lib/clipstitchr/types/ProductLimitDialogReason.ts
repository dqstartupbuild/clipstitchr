export type ProductLimitDialogReason =
  | Readonly<{ kind: "create" }>
  | Readonly<{ kind: "locked"; productName: string }>;
