import type { AppUgcClipAnswer } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipAnswer";
import type { AppUgcClipQuestionId } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipQuestionId";

export type AppUgcClipAnswers = Record<AppUgcClipQuestionId, AppUgcClipAnswer>;
