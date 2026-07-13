import type { AppUgcBriefDeliverableSize } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefDeliverableSize";

export const appUgcBriefDeliverableSizeOptions: Array<{
  description: string;
  label: string;
  value: AppUgcBriefDeliverableSize;
}> = [
  { description: "8 separate clips", label: "Lean set", value: "lean" },
  {
    description: "12 separate clips",
    label: "Standard set",
    value: "standard",
  },
  {
    description: "20 separate clips",
    label: "Batch-ready set",
    value: "batch-ready",
  },
];
