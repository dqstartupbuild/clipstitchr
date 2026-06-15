export type StitchrTextGenerationClipContext = {
  id: string;
  role: "demo" | "ugc";
  name: string;
  libraryKind?: "clipr" | "demo" | "swapr" | "ugc";
  tags?: string[];
  videoDescription?: string;
  mainPersonDescription?: string;
  outfitDescription?: string;
  locationDescription?: string;
  poseDescription?: string;
  productDescription?: string;
  quickEditOverlayTextHint?: string;
  quickEditOverlayTextReason?: string;
};
