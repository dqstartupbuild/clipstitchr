import { describe, expect, it } from "vitest";
import { resolvePublishingTenantIdentity } from "@/lib/clipstitchr/publishing/identity/resolvePublishingTenantIdentity";

describe("resolvePublishingTenantIdentity", () => {
  it("returns null when Clerk has no authenticated user", () => {
    expect(resolvePublishingTenantIdentity({})).toBeNull();
  });

  it("uses the immutable Clerk user ID for a personal tenant", () => {
    expect(
      resolvePublishingTenantIdentity({ clerkUserId: "user_123" }),
    ).toEqual({
      actorId: "user_123",
      clerkOrganizationId: null,
      clerkOrganizationRole: null,
      clerkUserId: "user_123",
      kind: "personal",
      tenantKey: "clerk-personal:user_123",
    });
  });

  it("uses the active Clerk organization instead of the personal tenant", () => {
    expect(
      resolvePublishingTenantIdentity({
        clerkOrganizationId: "org_456",
        clerkOrganizationRole: "org:admin",
        clerkUserId: "user_123",
      }),
    ).toEqual({
      actorId: "user_123",
      clerkOrganizationId: "org_456",
      clerkOrganizationRole: "org:admin",
      clerkUserId: "user_123",
      kind: "organization",
      tenantKey: "clerk-organization:org_456",
    });
  });

  it("does not accept an organization without an authenticated user", () => {
    expect(
      resolvePublishingTenantIdentity({
        clerkOrganizationId: "org_456",
        clerkOrganizationRole: "org:admin",
      }),
    ).toBeNull();
  });
});
