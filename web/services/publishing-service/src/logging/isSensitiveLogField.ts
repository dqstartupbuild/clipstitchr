const SENSITIVE_FIELD_FRAGMENTS = [
  "accesstoken",
  "refreshtoken",
  "token",
  "secret",
  "password",
  "authorization",
  "assertion",
  "cookie",
  "codeverifier",
  "oauthcode",
  "oauthstate",
  "pkce",
  "signedurl",
  "providerpayload",
  "providerresponse",
  "credentials",
];

export const isSensitiveLogField = (fieldName: string): boolean => {
  const normalizedName = fieldName.toLowerCase().replace(/[^a-z0-9]/g, "");
  return (
    normalizedName === "state" ||
    normalizedName === "code" ||
    SENSITIVE_FIELD_FRAGMENTS.some((fragment) => normalizedName.includes(fragment))
  );
};
