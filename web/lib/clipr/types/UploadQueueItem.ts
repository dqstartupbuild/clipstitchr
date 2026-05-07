import type { ClipType } from "@/lib/clipr/types/ClipType";
import type { ProcessingStatus } from "@/lib/clipr/types/ProcessingStatus";

export type UploadQueueItem = {
  id: string;
  fileName: string;
  fileSize: number;
  clipType: ClipType;
  status: ProcessingStatus;
  progress: number;
  error?: string;
};
