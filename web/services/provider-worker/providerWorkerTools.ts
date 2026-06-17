export const PROVIDER_TOOLS = [
  "stitchr",
  "swapr",
  "clipr",
  "avatar-photo",
  "swipr",
] as const;

export type ProviderTool = (typeof PROVIDER_TOOLS)[number];
