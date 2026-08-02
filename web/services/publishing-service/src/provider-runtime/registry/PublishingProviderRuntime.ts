import type { InstagramFacebookProviderAdapter } from "../instagram/InstagramFacebookProviderAdapter.js";
import type { InstagramStandaloneProviderAdapter } from "../instagram/InstagramStandaloneProviderAdapter.js";
import type { TikTokProviderAdapter } from "../tiktok/TikTokProviderAdapter.js";

export type PublishingProviderRuntime =
  | InstagramFacebookProviderAdapter
  | InstagramStandaloneProviderAdapter
  | TikTokProviderAdapter;
