export type ActiveWorkerJob = {
  completedAt?: string;
  createdAt?: string;
  error?: string;
  id: string;
  jobType: string;
  progress?: number;
  stage: string;
  status: string;
  updatedAt?: string;
  worker?: "media" | "provider";
};
