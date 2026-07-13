import type { ClipNamingToken } from "@/lib/clipstitchr/tools/clipNamingSystem/ClipNamingToken";

export const clipNamingTokenLabels: Readonly<Record<ClipNamingToken, string>> =
  {
    app: "App",
    campaign: "Campaign",
    role: "Clip role",
    creator: "Creator",
    concept: "Concept",
    market: "Market",
    date: "Date",
    version: "Version",
  };
