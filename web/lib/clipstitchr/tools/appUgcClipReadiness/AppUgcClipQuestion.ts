import type { AppUgcClipQuestionId } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipQuestionId";

export type AppUgcClipQuestion = {
  fix: string;
  id: AppUgcClipQuestionId;
  isCritical: boolean;
  isSpokenOnly: boolean;
  prompt: string;
  target: string;
  weight: number;
};
