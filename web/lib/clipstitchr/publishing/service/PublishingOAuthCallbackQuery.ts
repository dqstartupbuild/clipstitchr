export type PublishingOAuthCallbackQuery =
  | Readonly<{ code: string; state: string }>
  | Readonly<{ denied: true; state: string }>;
