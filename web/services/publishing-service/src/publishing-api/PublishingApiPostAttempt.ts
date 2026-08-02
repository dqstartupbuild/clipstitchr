export type PublishingApiPostAttempt = Readonly<{
  finishedAt: string | null;
  id: string;
  message: string | null;
  number: number;
  startedAt: string | null;
  status:
    | "canceled"
    | "failed"
    | "intent"
    | "started"
    | "succeeded"
    | "uncertain";
}>;
