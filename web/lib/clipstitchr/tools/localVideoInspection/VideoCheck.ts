import type { VideoCheckStatus } from "@/lib/clipstitchr/tools/localVideoInspection/VideoCheckStatus";

export type VideoCheck = {
  id: string;
  title: string;
  status: VideoCheckStatus;
  weight: number;
  isCritical: boolean;
  observed: string;
  target: string;
  fix: string | null;
};
