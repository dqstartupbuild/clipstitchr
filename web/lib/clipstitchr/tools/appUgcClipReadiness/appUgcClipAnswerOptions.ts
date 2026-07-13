import type { AppUgcClipAnswer } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipAnswer";

export const appUgcClipAnswerOptions: Array<{
  label: string;
  value: AppUgcClipAnswer;
}> = [
  { label: "Yes", value: "yes" },
  { label: "Not sure", value: "not-sure" },
  { label: "No", value: "no" },
];
