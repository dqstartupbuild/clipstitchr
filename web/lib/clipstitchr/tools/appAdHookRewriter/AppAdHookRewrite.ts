import type { AppAdHookRewriteDirection } from "@/lib/clipstitchr/tools/appAdHookRewriter/AppAdHookRewriteDirection";

export type AppAdHookRewrite = {
  direction: AppAdHookRewriteDirection;
  label: string;
  note: string;
  text: string;
};
