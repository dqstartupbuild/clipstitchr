import type { ClipType } from "@/lib/clipstitchr/types/ClipType";
import type { ProcessingStatus } from "@/lib/clipstitchr/types/ProcessingStatus";

export type UploadQueueItem = {
  id: string;
  fileName: string;
  fileSize: number;
  clipType: ClipType;
  productId?: string;
  status: ProcessingStatus;
  progress: number;
  error?: string;
};
