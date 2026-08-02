import type { Prisma } from "@prisma/client";

export type PublishingAttemptResumeState = Readonly<{
  attemptId: string;
  attemptNumber: number;
  checkpointVersion: number;
  checkpoint: Prisma.JsonValue;
  resumeRequired: boolean;
  providerCallAllowed: boolean;
}>;
