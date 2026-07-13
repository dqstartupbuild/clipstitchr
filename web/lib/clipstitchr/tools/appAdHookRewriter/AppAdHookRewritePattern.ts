import type { AppAdHookRewriteDirection } from "@/lib/clipstitchr/tools/appAdHookRewriter/AppAdHookRewriteDirection";

export type AppAdHookRewritePattern = {
  direction: AppAdHookRewriteDirection;
  label: string;
  note: string;
  template: string;
};
