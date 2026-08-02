import { describe, expect, it } from "vitest";
import { createPublishingServiceClerkTenantIdentity } from "@/lib/clipstitchr/publishing/service/createPublishingServiceClerkTenantIdentity";

describe("createPublishingServiceClerkTenantIdentity", () => {
  it("maps a personal Clerk identity to the assertion identity", () => {
    expect(
      createPublishingServiceClerkTenantIdentity({
        actorId: "user_123",
        clerkOrganizationId: null,
        clerkOrganizationRole: null,
        clerkUserId: "user_123",
        kind: "personal",
        tenantKey: "clerk-personal:user_123",
      }),
    ).toEqual({
      actorUserId: "user_123",
      kind: "personal",
      organizationId: undefined,
      tenantKey: "clerk-personal:user_123",
    });
  });

  it("maps the active Clerk organization without mutable profile data", () => {
    expect(
      createPublishingServiceClerkTenantIdentity({
        actorId: "user_123",
        clerkOrganizationId: "org_456",
        clerkOrganizationRole: "org:admin",
        clerkUserId: "user_123",
        kind: "organization",
        tenantKey: "clerk-organization:org_456",
      }),
    ).toEqual({
      actorUserId: "user_123",
      kind: "organization",
      organizationId: "org_456",
      tenantKey: "clerk-organization:org_456",
    });
  });
});
