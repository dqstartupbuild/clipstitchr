import type { HookLabStitchSource } from "@/lib/clipstitchr/types/HookLabStitchSource";

type HookLabStitchSourceDocument = {
  createdAt: string;
  id: string;
  name: string;
  productId?: string;
  socialCaption?: string;
};

export function createHookLabStitchSourceFromConvexDocument(
  document: HookLabStitchSourceDocument,
): HookLabStitchSource {
  return {
    createdAt: document.createdAt,
    id: document.id,
    name: document.name,
    productId: document.productId,
    socialCaption: document.socialCaption,
  };
}
