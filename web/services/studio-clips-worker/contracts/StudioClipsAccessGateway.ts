export type StudioClipsAccessGateway = {
  assertClaimLease: (input: {
    attempt: number;
    leaseId: string;
    ownerId: string;
    productId: string;
    taskId: string;
  }) => Promise<void>;
  assertProductOwnership: (input: {
    ownerId: string;
    productId: string;
    taskId: string;
  }) => Promise<void>;
  assertStudioAccess: (input: {
    ownerId: string;
    taskId: string;
  }) => Promise<void>;
};
