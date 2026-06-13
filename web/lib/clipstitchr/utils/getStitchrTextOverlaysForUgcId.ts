import type { TextOverlay } from "@/lib/clipstitchr/types/TextOverlay";

type GetStitchrTextOverlaysForUgcIdOptions = {
  fallbackTextOverlays?: TextOverlay[] | null;
  textOverlaysByUgcId: Record<string, TextOverlay[]>;
  ugcId: string;
};

export function getStitchrTextOverlaysForUgcId({
  fallbackTextOverlays,
  textOverlaysByUgcId,
  ugcId,
}: GetStitchrTextOverlaysForUgcIdOptions) {
  return textOverlaysByUgcId[ugcId] ?? fallbackTextOverlays ?? [];
}
