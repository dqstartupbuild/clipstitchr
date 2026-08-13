const MAX_STORED_STATE_LENGTH = 16_384;

export const isStoredOAuthStateValue = (value: unknown): value is string =>
  typeof value === "string" &&
  value.length > 0 &&
  value.length <= MAX_STORED_STATE_LENGTH;
