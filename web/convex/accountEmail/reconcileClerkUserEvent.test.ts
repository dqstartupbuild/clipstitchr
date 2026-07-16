import { beforeEach, describe, expect, it, vi } from "vitest";
import { reconcileClerkUserEvent } from "./reconcileClerkUserEvent";

const communicationMocks = vi.hoisted(() => ({
  cancel: vi.fn(),
  resume: vi.fn(),
  welcome: vi.fn(),
}));

vi.mock("./cancelAccountEmailOperationsForOwner", () => ({
  cancelAccountEmailOperationsForOwner: communicationMocks.cancel,
}));
vi.mock("./resumeHeldAccountEmailOperationsForOwner", () => ({
  resumeHeldAccountEmailOperationsForOwner: communicationMocks.resume,
}));
vi.mock("./createAccountCreatedCommunication", () => ({
  createAccountCreatedCommunication: communicationMocks.welcome,
}));

type ReconcileHandler = {
  handler: (ctx: unknown, args: Record<string, unknown>) => Promise<unknown>;
};

vi.mock("../_generated/server", () => ({
  internalMutation: vi.fn((definition) => definition),
}));

const eventAt = Date.UTC(2026, 6, 16, 12);
const processedAt = eventAt + 100;
const contactInput = {
  displayName: "Person Example",
  firstName: "Person",
  normalizedEmail: "person@example.com",
  primaryEmailId: "email_primary",
};

function createContext({
  accountContact = null,
  webhookEvent = null,
}: {
  accountContact?: Record<string, unknown> | null;
  webhookEvent?: Record<string, unknown> | null;
} = {}) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const insert = vi.fn(async (table: string) => `${table}_1`);
  const patch = vi.fn();
  const query = vi.fn((table: string) => {
    const chain = {
      unique: vi.fn(async () =>
        table === "clerkWebhookEvents" ? webhookEvent : accountContact,
      ),
      withIndex: vi.fn((_indexName: string, callback: (query: unknown) => void) => {
        callback(indexQuery);
        return chain;
      }),
    };

    return chain;
  });

  return { db: { insert, patch, query }, indexQuery };
}

function reconcile(
  ctx: ReturnType<typeof createContext>,
  overrides: Record<string, unknown> = {},
) {
  return (reconcileClerkUserEvent as unknown as ReconcileHandler).handler(ctx, {
    contact: contactInput,
    eventAt,
    eventType: "user.created",
    ownerId: "user_123",
    processedAt,
    webhookId: "webhook_123",
    ...overrides,
  });
}

describe("reconcileClerkUserEvent", () => {
  beforeEach(() => vi.clearAllMocks());

  it("atomically inserts a valid contact and marks first creation welcome-eligible", async () => {
    const ctx = createContext();

    await expect(reconcile(ctx)).resolves.toEqual({
      status: "processed",
      welcomeEligible: true,
    });
    expect(ctx.db.insert).toHaveBeenNthCalledWith(
      1,
      "accountContacts",
      expect.objectContaining({
        emailVerified: true,
        normalizedEmail: "person@example.com",
        ownerId: "user_123",
        primaryEmailId: "email_primary",
      }),
    );
    expect(communicationMocks.resume).toHaveBeenCalledWith(ctx, {
      now: processedAt,
      ownerId: "user_123",
    });
    expect(communicationMocks.welcome).toHaveBeenCalledWith(ctx, {
      now: processedAt,
      ownerId: "user_123",
    });
    expect(ctx.db.insert).toHaveBeenNthCalledWith(
      2,
      "clerkWebhookEvents",
      expect.objectContaining({
        eventType: "user.created",
        status: "processed",
        webhookId: "webhook_123",
      }),
    );
  });

  it("records invalid or unverified contact input as ignored", async () => {
    const ctx = createContext();

    await expect(reconcile(ctx, { contact: undefined })).resolves.toEqual({
      status: "ignored",
      welcomeEligible: false,
    });
    expect(ctx.db.insert).toHaveBeenCalledOnce();
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "clerkWebhookEvents",
      expect.objectContaining({ status: "ignored" }),
    );
  });

  it("marks the first verified contact from a later user update welcome-eligible", async () => {
    const ctx = createContext();

    await expect(
      reconcile(ctx, { eventType: "user.updated" }),
    ).resolves.toEqual({ status: "processed", welcomeEligible: true });
  });

  it("returns duplicate without changing contact state", async () => {
    const ctx = createContext({ webhookEvent: { _id: "event_existing" } });

    await expect(reconcile(ctx)).resolves.toEqual({
      status: "duplicate",
      welcomeEligible: false,
    });
    expect(ctx.db.insert).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("records a stale update without overwriting newer contact data", async () => {
    const ctx = createContext({
      accountContact: {
        _id: "contact_existing",
        deletedAt: undefined,
        lastClerkEventAt: eventAt + 1,
        lastClerkWebhookId: "webhook_newer",
      },
    });

    await expect(
      reconcile(ctx, {
        eventType: "user.updated",
        webhookId: "webhook_stale",
      }),
    ).resolves.toEqual({ status: "ignored", welcomeEligible: false });
    expect(ctx.db.patch).not.toHaveBeenCalled();
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "clerkWebhookEvents",
      expect.objectContaining({ status: "ignored" }),
    );
  });

  it("clears PII and records deletion on an existing contact", async () => {
    const ctx = createContext({
      accountContact: {
        _id: "contact_existing",
        deletedAt: undefined,
        lastClerkEventAt: eventAt - 1,
        lastClerkWebhookId: "webhook_older",
      },
    });

    await expect(
      reconcile(ctx, {
        contact: undefined,
        eventType: "user.deleted",
        webhookId: "webhook_deleted",
      }),
    ).resolves.toEqual({ status: "processed", welcomeEligible: false });
    expect(ctx.db.patch).toHaveBeenCalledWith("contact_existing", {
      deletedAt: eventAt,
      displayName: undefined,
      emailVerified: false,
      firstName: undefined,
      lastClerkEventAt: eventAt,
      lastClerkWebhookId: "webhook_deleted",
      normalizedEmail: "",
      primaryEmailId: "",
      updatedAt: processedAt,
    });
    expect(communicationMocks.cancel).toHaveBeenCalledWith(ctx, {
      canceledAt: processedAt,
      ownerId: "user_123",
    });
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "clerkWebhookEvents",
      expect.objectContaining({ status: "processed" }),
    );
  });

  it("lets deletion win a same-time ordering tie", async () => {
    const ctx = createContext({
      accountContact: {
        _id: "contact_existing",
        deletedAt: undefined,
        lastClerkEventAt: eventAt,
        lastClerkWebhookId: "zzzz_update",
      },
    });

    await expect(
      reconcile(ctx, {
        contact: undefined,
        eventType: "user.deleted",
        webhookId: "aaaa_delete",
      }),
    ).resolves.toEqual({ status: "processed", welcomeEligible: false });
    expect(ctx.db.patch).toHaveBeenCalledOnce();
  });
});
