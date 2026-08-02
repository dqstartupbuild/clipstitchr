import type { PostBridgePostStatus } from "@/lib/clipstitchr/types/PostBridgePostStatus";

export type PostBridgePost = {
  caption: string;
  created_at: string;
  id: string;
  is_draft: boolean;
  scheduled_at: unknown;
  social_accounts: number[];
  status: PostBridgePostStatus;
  updated_at: string;
  warnings?: string[];
};
