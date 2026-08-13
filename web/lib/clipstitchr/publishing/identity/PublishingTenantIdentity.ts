export type PublishingTenantIdentity = {
  actorId: string;
  clerkOrganizationId: string | null;
  clerkOrganizationRole: string | null;
  clerkUserId: string;
  kind: "organization" | "personal";
  tenantKey: string;
};
