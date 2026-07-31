export type SocialOAuthCallbackStage =
  | "configuration"
  | "session"
  | "state"
  | "authorization"
  | "token_exchange"
  | "token_encryption"
  | "account_save";
