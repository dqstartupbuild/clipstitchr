import type { ClipNamingSystemInput } from "@/lib/clipstitchr/tools/clipNamingSystem/ClipNamingSystemInput";
import { clipNamingTokens } from "@/lib/clipstitchr/tools/clipNamingSystem/clipNamingTokens";

export const defaultClipNamingSystemInput: ClipNamingSystemInput = {
  app: "ClipStitchr",
  campaign: "Summer Launch",
  role: "UGC Hook",
  creator: "Maya",
  concept: "Before and After",
  market: "US",
  date: "2026-07-12",
  separator: "_",
  tokenOrder: clipNamingTokens,
  version: "v01",
};
