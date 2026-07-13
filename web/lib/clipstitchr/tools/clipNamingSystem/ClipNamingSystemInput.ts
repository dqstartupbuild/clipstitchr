import type { ClipNamingToken } from "@/lib/clipstitchr/tools/clipNamingSystem/ClipNamingToken";

export type ClipNamingSystemInput = {
  app: string;
  campaign: string;
  role: string;
  creator: string;
  concept: string;
  market: string;
  date: string;
  version: string;
  separator: "-" | "_";
  tokenOrder: readonly ClipNamingToken[];
};
