import type { SwaprPhotoPreparation } from "@/lib/clipstitchr/types/SwaprPhotoPreparation";

export type PhotoAsset = {
  id: string;
  name: string;
  originalName: string;
  blob: Blob;
  originalBlob?: Blob;
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
