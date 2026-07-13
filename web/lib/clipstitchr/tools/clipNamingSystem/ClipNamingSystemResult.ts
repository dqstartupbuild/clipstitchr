import type { ClipNamingLegendItem } from "@/lib/clipstitchr/tools/clipNamingSystem/ClipNamingLegendItem";

export type ClipNamingSystemResult = {
  convention: string;
  examples: readonly string[];
  filename: string;
  legend: readonly ClipNamingLegendItem[];
};
