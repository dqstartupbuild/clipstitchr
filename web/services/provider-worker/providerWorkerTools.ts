export const PROVIDER_TOOLS = [
  "stitchr",
  "swapr",
  "clipr",
  "avatar-photo",
  "swipr",
  "post-bridge",
] as const;

export type ProviderTool = (typeof PROVIDER_TOOLS)[number];
