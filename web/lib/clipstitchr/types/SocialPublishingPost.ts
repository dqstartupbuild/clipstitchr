import type { SocialPublishingPostStatus } from "@/lib/clipstitchr/types/SocialPublishingPostStatus";

export type SocialPublishingPost = {
  caption: string;
  created_at: string;
  id: string;
  is_draft: boolean;
  scheduled_at: string | null;
  social_accounts: string[];
  status: SocialPublishingPostStatus;
  updated_at: string;
  warnings?: string[];
};
