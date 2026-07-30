import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";

export type SocialSchedulePost = FunctionReturnType<
  typeof api.socialPosts.listSocialSchedule.listSocialSchedule
>[number];
