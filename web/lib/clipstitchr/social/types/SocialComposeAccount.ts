import type { SocialPlatform } from "./SocialPlatform";

export type SocialComposeAccount = {
  id: string;
  platform: SocialPlatform;
  username: string;
  displayName?: string;
  status: string;
  capabilitySnapshotJson?: string;
  capabilityCheckedAt?: string;
};
