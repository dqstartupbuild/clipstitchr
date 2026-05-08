import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import type { SwaprPhotoPreparation } from "@/lib/clipstitchr/types/SwaprPhotoPreparation";

export type PhotoAsset = {
  id: string;
  name: string;
  tags?: string[];
  originalName: string;
  photoObject: R2ObjectReference;
  blob: Blob;
  originalObject?: R2ObjectReference;
  originalBlob?: Blob;
  thumbnailObject?: R2ObjectReference;
  thumbnailBlob?: Blob;
  mimeType: string;
  originalMimeType?: string;
  size: number;
  originalSize?: number;
  width: number;
  height: number;
  originalWidth?: number;
  originalHeight?: number;
  preparation?: SwaprPhotoPreparation;
  consentAcknowledgedAt?: string;
  createdAt: string;
  updatedAt: string;
};
