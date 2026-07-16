export type AccountEmailProcessResult =
  | Readonly<{ processed: true }>
  | Readonly<{ processed: false; reason: string }>;
