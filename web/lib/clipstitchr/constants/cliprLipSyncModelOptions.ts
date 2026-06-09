import type { CliprLipSyncModelId } from "@/lib/clipstitchr/types/CliprLipSyncModelId";

export const cliprLipSyncModelOptions: Array<{
  description: string;
  label: string;
  value: CliprLipSyncModelId;
}> = [
  {
    description: "Skip a second lip-sync pass after avatar video creation.",
    label: "Off",
    value: "none",
  },
  {
    description: "Video plus audio lip sync pass using LatentSync.",
    label: "ByteDance LatentSync",
    value:
      "bytedance/latentsync:637ce1919f807ca20da3a448ddc2743535d2853649574cd52a933120e9b9e293",
  },
  {
    description: "Video plus audio lip sync pass using PixVerse.",
    label: "PixVerse Lip Sync",
    value: "pixverse/lipsync",
  },
];
