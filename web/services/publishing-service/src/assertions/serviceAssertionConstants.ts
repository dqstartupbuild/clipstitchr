export const SERVICE_ASSERTION_DEFAULT_TTL_SECONDS = 60;
export const SERVICE_ASSERTION_MAX_TTL_SECONDS = 120;
export const SERVICE_ASSERTION_CLOCK_SKEW_SECONDS = 5;
export const SERVICE_ASSERTION_MAX_LENGTH = 8_192;

export const SERVICE_ASSERTION_HEADER = Object.freeze({
  alg: "HS256",
  typ: "CS-SA",
  v: 1,
} as const);
