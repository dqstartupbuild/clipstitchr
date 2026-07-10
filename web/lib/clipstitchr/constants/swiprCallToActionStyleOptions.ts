import type { SwiprCallToActionStyle } from "@/lib/clipstitchr/types/SwiprCallToActionStyle";

export const swiprCallToActionStyleOptions: Array<{
  id: SwiprCallToActionStyle;
  label: string;
}> = [
  { id: "any", label: "Any" },
  { id: "save", label: "Save this" },
  { id: "follow", label: "Follow" },
  { id: "engagement", label: "Engagement" },
  { id: "product", label: "Promote product" },
];
