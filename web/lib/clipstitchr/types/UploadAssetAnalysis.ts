import type { ClipPerformanceScore } from "@/lib/clipstitchr/types/ClipPerformanceScore";

export type UploadAssetAnalysis = {
  avatarDescription?: string;
  mainPersonDescription?: string;
  outfitDescription?: string;
  locationDescription?: string;
  poseDescription?: string;
  performanceScore?: ClipPerformanceScore;
  productDescription?: string;
  videoDescription?: string;
  name: string;
  tags: string[];
};
