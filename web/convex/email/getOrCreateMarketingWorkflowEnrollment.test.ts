import { describe, expect, it, vi } from "vitest";
import { getOrCreateMarketingWorkflowEnrollment } from "./getOrCreateMarketingWorkflowEnrollment";

function createContext(existing: unknown) {
  const indexQuery = { eq: vi.fn(() => indexQuery) };
  const chain = {
    unique: vi.fn(async () => existing),
    withIndex: vi.fn((_name, callback) => {
      callback(indexQuery);
      return chain;
    }),
  };

  return {
    db: {
      insert: vi.fn(async () => "enrollment_1"),
      query: vi.fn(() => chain),
    },
  };
}

describe("logical marketing workflow enrollment", () => {
  it("creates one record for a contact, workflow, and version", async () => {
    const ctx = createContext(null);

    await expect(
      getOrCreateMarketingWorkflowEnrollment(ctx as never, {
        contactId: "contact_1" as never,
        createdAt: 100,
        workflowKey: "tool_lead_captured",
        workflowVersion: "v1",
      }),
    ).resolves.toEqual({ created: true, enrollmentId: "enrollment_1" });
    expect(ctx.db.insert).toHaveBeenCalledOnce();
  });

  it("reuses the existing logical enrollment without restarting it", async () => {
    const ctx = createContext({ _id: "enrollment_existing" });

    await expect(
      getOrCreateMarketingWorkflowEnrollment(ctx as never, {
        contactId: "contact_1" as never,
        createdAt: 100,
        workflowKey: "tool_lead_captured",
        workflowVersion: "v1",
      }),
    ).resolves.toEqual({
      created: false,
      enrollmentId: "enrollment_existing",
    });
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });
});
