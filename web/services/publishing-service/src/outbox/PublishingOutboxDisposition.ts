export type PublishingOutboxDisposition =
  | Readonly<{ kind: "complete" }>
  | Readonly<{
      kind: "retry";
      availableAt: Date;
      safeErrorCode: string;
    }>
  | Readonly<{
      kind: "dead-letter";
      safeErrorCode: string;
    }>;
