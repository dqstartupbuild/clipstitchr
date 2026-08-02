export type PublishingCallbackRequest =
  | Readonly<{ code: string; state: string }>
  | Readonly<{ denied: true; state: string }>;
