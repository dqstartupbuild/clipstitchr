import { describe, expect, it } from "vitest";

import { InvalidPublishingTenantError } from "../src/errors/InvalidPublishingTenantError.js";
import { resolveClerkTenantIdentity } from "../src/identity/resolveClerkTenantIdentity.js";

describe("resolveClerkTenantIdentity", () => {
  it("derives a personal tenant from the immutable Clerk user ID", () => {
    const identity = resolveClerkTenantIdentity({ actorUserId: "user_person_123" });

    expect(identity).toEqual({
      kind: "personal",
      tenantKey: "clerk-personal:user_person_123",
      actorUserId: "user_person_123",
      organizationId: undefined,
    });
    expect(Object.isFrozen(identity)).toBe(true);
  });

  it("prefers the active immutable Clerk organization ID", () => {
    expect(
      resolveClerkTenantIdentity({
        actorUserId: "user_member_123",
        activeOrganizationId: "org_team_456",
      }),
    ).toEqual({
      kind: "organization",
      tenantKey: "clerk-organization:org_team_456",
      actorUserId: "user_member_123",
      organizationId: "org_team_456",
    });
  });

  it("does not accept an email address as a tenant identity", () => {
    expect(() =>
      resolveClerkTenantIdentity({ actorUserId: "person@example.invalid" }),
    ).toThrow(InvalidPublishingTenantError);
  });

  it("rejects an organization value that is not a Clerk organization ID", () => {
    expect(() =>
      resolveClerkTenantIdentity({
        actorUserId: "user_member_123",
        activeOrganizationId: "workspace_mutable_slug",
      }),
    ).toThrow(InvalidPublishingTenantError);
  });
});
