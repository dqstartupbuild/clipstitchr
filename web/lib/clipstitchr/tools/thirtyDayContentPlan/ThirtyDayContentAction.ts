import type { ThirtyDayContentActionKind } from "@/lib/clipstitchr/tools/thirtyDayContentPlan/ThirtyDayContentActionKind";

export type ThirtyDayContentAction = {
  asset: string;
  date: string;
  dayNumber: number;
  detail: string;
  kind: ThirtyDayContentActionKind;
  title: string;
};
