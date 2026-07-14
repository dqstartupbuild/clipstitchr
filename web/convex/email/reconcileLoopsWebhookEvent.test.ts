import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { reconcileLoopsWebhookEvent } from "./reconcileLoopsWebhookEvent";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

vi.mock("../_generated/server", () => ({
  internalMutation: vi.fn((value) => value),
}));
vi.mock("./cancelEmailProviderOperationsForContact", () => ({
  cancelEmailProviderOperationsForContact: vi.fn(),
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

const contact = {
  _id: "contact_1",
  consentStatus: "confirmed",
  deletionStatus: "active",
  marketingEligible: true,
  providerContactId: undefined as string | undefined,
  providerContactKey: "provider_key_1",
  subscriptionChangedAt: undefined as number | undefined,
  subscriptionStatus: "subscribed",
  suppressionChangedAt: undefined as number | undefined,
  suppressionStatus: "none",
  verificationStatus: "verified",
};
const eventTime = 1_783_958_400;
const eventAt = eventTime * 1_000;
const baseArgs = {
  contactIdentity: {
    email: "person@example.com",
    id: "loops_contact_1",
    userId: "provider_key_1",
  },
  eventName: "contact.mailingList.subscribed" as const,
  eventTime,
  mailingListId: "mailing_list_1",
  providerEmailId: null,
  providerEmailMessageId: null,
  providerSourceId: null,
  receivedAt: eventAt + 100,
  sourceType: null,
  webhookId: "webhook_1",
  webhookSchemaVersion: "1.0.0" as const,
};

function createContext({
  contactByIdentity = true,
  emailCandidates = [],
  membership = null,
  operation = null,
}: {
  contactByIdentity?: boolean;
  emailCandidates?: unknown[];
  membership?: unknown;
  operation?: Record<string, unknown> | null;
} = {}) {
  const indexQuery = {
    eq: vi.fn((field: string, value: unknown): unknown => {
      void field;
      void value;
      return indexQuery;
    }),
  };
  const db = {
    get: vi.fn(async (id) => {
      if (id === contact._id) return contact;
      if (operation && id === operation._id) return operation;
      return null;
    }),
    insert: vi.fn(async (table) => `${table}_1`),
    patch: vi.fn(async (id: string, fields: Record<string, unknown>) => {
      if (id === contact._id) Object.assign(contact, fields);
      if (operation && id === operation._id) Object.assign(operation, fields);
      if (membership && id === (membership as { _id?: string })._id) {
        Object.assign(membership, fields);
      }
    }),
    query: vi.fn((table) => {
      let indexName = "";
      let indexValue: unknown;
      const chain = {
        collect: vi.fn(async () => {
          if (table === "emailProviderOperations" && operation) {
            return [operation];
          }
          if (table === "marketingContacts") return emailCandidates;
          return [];
        }),
        unique: vi.fn(async () => {
          if (table === "loopsWebhookEvents") return null;
          if (table === "marketingContacts") {
            return contactByIdentity || contact.providerContactId
              ? contact
              : null;
          }
          if (table === "marketingMailingListMemberships") return membership;
          if (table === "emailProviderOperations") {
            if (indexName === "by_provider_message_id") {
              return operation?.providerMessageId === indexValue
                ? operation
                : null;
            }
            return operation;
          }
          return null;
        }),
        withIndex: vi.fn((name, callback) => {
          indexName = name;
          callback(indexQuery);
          indexValue = indexQuery.eq.mock.calls.at(-1)?.[1];
          return chain;
        }),
      };
      return chain;
    }),
  };

  return { db, indexQuery };
}

describe("Loops webhook reconciliation", () => {
  beforeEach(() => {
    Object.assign(contact, {
      consentStatus: "confirmed",
      deletionStatus: "active",
      marketingEligible: true,
      providerContactId: undefined,
      subscriptionChangedAt: undefined,
      subscriptionStatus: "subscribed",
      suppressionChangedAt: undefined,
      suppressionStatus: "none",
      verificationStatus: "verified",
    });
  });
  afterEach(() => vi.unstubAllEnvs());

  it("stores bounded mailing-list membership without changing global consent", async () => {
    const ctx = createContext();

    await expect(
      getHandler(reconcileLoopsWebhookEvent)(ctx, baseArgs),
    ).resolves.toEqual({ status: "applied" });
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "marketingMailingListMemberships",
      {
        contactId: "contact_1",
        eventAt,
        providerMailingListId: "mailing_list_1",
        status: "subscribed",
        updatedAt: eventAt + 100,
      },
    );
    expect(ctx.db.patch).not.toHaveBeenCalledWith(
      "contact_1",
      expect.anything(),
    );
  });

  it("does not let a stale list event reverse newer membership", async () => {
    const ctx = createContext({
      membership: {
        _id: "membership_1",
        eventAt: eventAt + 1,
        status: "unsubscribed",
      },
    });

    await expect(
      getHandler(reconcileLoopsWebhookEvent)(ctx, baseArgs),
    ).resolves.toEqual({ status: "ignoredStale" });
    expect(ctx.db.patch).not.toHaveBeenCalledWith(
      "membership_1",
      expect.anything(),
    );
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "loopsWebhookEvents",
      expect.objectContaining({ disposition: "ignoredStale" }),
    );
  });

  it("matches delivery by provider email ID, not template message ID", async () => {
    const operation = {
      _id: "operation_1",
      acceptanceStatus: "accepted",
      acceptedAt: eventAt - 100,
      contactId: "contact_1",
      deliveryChangedAt: undefined,
      deliveredAt: undefined,
      providerMessageId: "provider_email_1",
      status: "accepted",
      terminalAt: eventAt - 100,
      updatedAt: eventAt - 100,
    };
    const ctx = createContext({ operation });

    await getHandler(reconcileLoopsWebhookEvent)(ctx, {
      ...baseArgs,
      eventName: "email.delivered",
      mailingListId: null,
      providerEmailId: "provider_email_1",
      providerEmailMessageId: "template_version_1",
      providerSourceId: "transactional_template_1",
      sourceType: "transactional",
    });

    expect(ctx.db.patch).toHaveBeenCalledWith(
      "operation_1",
      expect.objectContaining({
        deliveryStatus: "delivered",
        status: "delivered",
      }),
    );
    expect(ctx.indexQuery.eq).toHaveBeenCalledWith(
      "providerMessageId",
      "provider_email_1",
    );
    expect(ctx.indexQuery.eq).not.toHaveBeenCalledWith(
      "providerMessageId",
      "template_version_1",
    );
  });

  it.each([
    ["email.hardBounced", "bounced"],
    ["email.spamReported", "complained"],
  ] as const)(
    "does not revive a canceled operation while recording %s",
    async (eventName, deliveryStatus) => {
      const operation = {
        _id: "operation_1",
        acceptanceStatus: "notAttempted",
        acceptedAt: undefined,
        attemptLeaseOwner: "stale_worker",
        contactId: "contact_1",
        deliveryChangedAt: undefined,
        deliveryStatus: "pending",
        leaseExpiresAt: eventAt + 1_000,
        leaseOwner: "stale_worker",
        providerMessageId: "provider_email_1",
        status: "canceled",
        terminalAt: eventAt - 100,
        updatedAt: eventAt - 100,
      };
      const ctx = createContext({ operation });

      await getHandler(reconcileLoopsWebhookEvent)(ctx, {
        ...baseArgs,
        eventName,
        mailingListId: null,
        providerEmailId: "provider_email_1",
        providerEmailMessageId: "template_version_1",
        providerSourceId: "transactional_template_1",
        sourceType: "transactional",
      });

      const deliveryPatch = ctx.db.patch.mock.calls.find(
        ([id, fields]) =>
          id === "operation_1" && fields.deliveryStatus === deliveryStatus,
      )?.[1];
      expect(deliveryPatch).toBeDefined();
      expect(deliveryPatch).toMatchObject({
        acceptanceStatus: "accepted",
        attemptLeaseOwner: undefined,
        leaseExpiresAt: undefined,
        leaseOwner: undefined,
        status: "canceled",
      });
    },
  );

  it("links a new confirmation contact by unique email, then reconciles delivery", async () => {
    vi.stubEnv(
      "LOOPS_EMAIL_CONFIRMATION_TRANSACTIONAL_ID",
      "confirmation_template",
    );
    const operation = {
      _id: "operation_1",
      acceptanceStatus: "notAttempted",
      acceptedAt: undefined,
      attemptLeaseOwner: "worker_1",
      contactId: "contact_1",
      createdAt: eventAt - 1_000,
      deliveryStatus: "pending",
      kind: "transactional",
      leaseExpiresAt: eventAt + 1_000,
      leaseOwner: "worker_1",
      providerMessageId: undefined,
      status: "claimed",
      transactionalTemplateKey: "email-confirmation",
      updatedAt: eventAt,
    };
    const ctx = createContext({
      contactByIdentity: false,
      emailCandidates: [contact],
      operation,
    });
    const sentArgs = {
      ...baseArgs,
      contactIdentity: {
        email: "PERSON@example.com",
        id: "new_loops_contact",
        userId: null,
      },
      eventName: "transactional.email.sent" as const,
      mailingListId: null,
      providerEmailId: "provider_email_new",
      providerEmailMessageId: "template_version_1",
      providerSourceId: "confirmation_template",
      sourceType: "transactional" as const,
    };

    await expect(
      getHandler(reconcileLoopsWebhookEvent)(ctx, sentArgs),
    ).resolves.toEqual({ status: "applied" });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "operation_1",
      expect.objectContaining({ providerMessageId: "provider_email_new" }),
    );
    expect(operation).toMatchObject({
      acceptanceStatus: "accepted",
      acceptedAt: eventAt,
      attemptLeaseOwner: undefined,
      leaseExpiresAt: undefined,
      leaseOwner: undefined,
      status: "accepted",
    });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "contact_1",
      expect.objectContaining({ providerContactId: "new_loops_contact" }),
    );

    await expect(
      getHandler(reconcileLoopsWebhookEvent)(ctx, {
        ...sentArgs,
        eventName: "email.delivered",
        webhookId: "webhook_2",
      }),
    ).resolves.toEqual({ status: "applied" });
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "operation_1",
      expect.objectContaining({
        deliveryStatus: "delivered",
        status: "delivered",
      }),
    );
  });

  it("binds and applies an approved delivery that arrives before sent", async () => {
    vi.stubEnv(
      "LOOPS_EMAIL_CONFIRMATION_TRANSACTIONAL_ID",
      "confirmation_template",
    );
    const operation = {
      _id: "operation_1",
      acceptanceStatus: "notAttempted",
      acceptedAt: undefined,
      attemptLeaseOwner: "worker_1",
      contactId: "contact_1",
      createdAt: eventAt - 1_000,
      deliveryStatus: "pending",
      kind: "transactional",
      leaseExpiresAt: eventAt + 1_000,
      leaseOwner: "worker_1",
      providerMessageId: undefined,
      status: "claimed",
      transactionalTemplateKey: "email-confirmation",
      updatedAt: eventAt - 100,
    };
    const ctx = createContext({
      contactByIdentity: false,
      emailCandidates: [contact],
      operation,
    });
    const deliveryArgs = {
      ...baseArgs,
      contactIdentity: {
        email: "PERSON@example.com",
        id: "new_loops_contact",
        userId: null,
      },
      eventName: "email.delivered" as const,
      mailingListId: null,
      providerEmailId: "provider_email_early",
      providerEmailMessageId: "template_version_1",
      providerSourceId: "confirmation_template",
      sourceType: "transactional" as const,
    };

    await expect(
      getHandler(reconcileLoopsWebhookEvent)(ctx, deliveryArgs),
    ).resolves.toEqual({ status: "applied" });
    expect(operation).toMatchObject({
      acceptanceStatus: "accepted",
      acceptedAt: eventAt,
      attemptLeaseOwner: undefined,
      deliveryStatus: "delivered",
      leaseExpiresAt: undefined,
      leaseOwner: undefined,
      providerMessageId: "provider_email_early",
      status: "delivered",
    });

    await expect(
      getHandler(reconcileLoopsWebhookEvent)(ctx, {
        ...deliveryArgs,
        eventName: "transactional.email.sent",
        webhookId: "webhook_2",
      }),
    ).resolves.toEqual({ status: "applied" });
    expect(operation).toMatchObject({
      acceptanceStatus: "accepted",
      acceptedAt: eventAt,
      status: "delivered",
    });
  });

  it("ends an early soft bounce as accepted without retrying the send", async () => {
    vi.stubEnv(
      "LOOPS_EMAIL_CONFIRMATION_TRANSACTIONAL_ID",
      "confirmation_template",
    );
    const operation = {
      _id: "operation_1",
      acceptanceStatus: "unknown",
      acceptedAt: undefined,
      attemptLeaseOwner: "worker_1",
      contactId: "contact_1",
      createdAt: eventAt - 1_000,
      deliveryStatus: "pending",
      kind: "transactional",
      leaseExpiresAt: eventAt + 1_000,
      leaseOwner: "worker_1",
      providerMessageId: undefined,
      status: "claimed",
      transactionalTemplateKey: "email-confirmation",
      updatedAt: eventAt - 100,
    };
    const ctx = createContext({
      contactByIdentity: false,
      emailCandidates: [contact],
      operation,
    });

    await expect(
      getHandler(reconcileLoopsWebhookEvent)(ctx, {
        ...baseArgs,
        contactIdentity: {
          email: "PERSON@example.com",
          id: "new_loops_contact",
          userId: null,
        },
        eventName: "email.softBounced",
        mailingListId: null,
        providerEmailId: "provider_email_soft_bounce",
        providerEmailMessageId: "template_version_1",
        providerSourceId: "confirmation_template",
        sourceType: "transactional",
      }),
    ).resolves.toEqual({ status: "applied" });
    expect(operation).toMatchObject({
      acceptanceStatus: "accepted",
      acceptedAt: eventAt,
      attemptLeaseOwner: undefined,
      deliveryChangedAt: eventAt,
      deliveryStatus: "bounced",
      leaseExpiresAt: undefined,
      leaseOwner: undefined,
      providerMessageId: "provider_email_soft_bounce",
      status: "accepted",
    });
  });

  it("does not early-bind delivery from an unrelated template", async () => {
    vi.stubEnv(
      "LOOPS_EMAIL_CONFIRMATION_TRANSACTIONAL_ID",
      "confirmation_template",
    );
    const operation = {
      _id: "operation_1",
      contactId: "contact_1",
      createdAt: eventAt - 1_000,
      deliveryStatus: "pending",
      kind: "transactional",
      providerMessageId: undefined,
      status: "claimed",
      transactionalTemplateKey: "email-confirmation",
      updatedAt: eventAt,
    };
    const ctx = createContext({ operation });

    await expect(
      getHandler(reconcileLoopsWebhookEvent)(ctx, {
        ...baseArgs,
        eventName: "email.delivered",
        mailingListId: null,
        providerEmailId: "unrelated_email",
        providerEmailMessageId: "unrelated_version",
        providerSourceId: "other_transactional_template",
        sourceType: "transactional",
      }),
    ).resolves.toEqual({ status: "ignoredUnlinked" });
    expect(operation.providerMessageId).toBeUndefined();
  });

  it("ends equal-time subscribe and unsubscribe permutations unsubscribed", async () => {
    const unsubscribeArgs = {
      ...baseArgs,
      eventName: "email.unsubscribed" as const,
      mailingListId: null,
      webhookId: "unsubscribe_1",
    };
    const resubscribeArgs = {
      ...unsubscribeArgs,
      eventName: "email.resubscribed" as const,
      webhookId: "resubscribe_1",
    };
    contact.subscriptionChangedAt = eventAt;
    const unsubscribeFirstContext = createContext();

    await expect(
      getHandler(reconcileLoopsWebhookEvent)(
        unsubscribeFirstContext,
        unsubscribeArgs,
      ),
    ).resolves.toEqual({ status: "applied" });
    await expect(
      getHandler(reconcileLoopsWebhookEvent)(
        unsubscribeFirstContext,
        resubscribeArgs,
      ),
    ).resolves.toEqual({ status: "ignoredStale" });
    expect(contact.subscriptionStatus).toBe("unsubscribed");

    Object.assign(contact, {
      consentStatus: "confirmed",
      marketingEligible: true,
      subscriptionChangedAt: eventAt,
      subscriptionStatus: "subscribed",
    });
    const unsubscribeLastContext = createContext();

    await getHandler(reconcileLoopsWebhookEvent)(
      unsubscribeLastContext,
      resubscribeArgs,
    );
    await getHandler(reconcileLoopsWebhookEvent)(
      unsubscribeLastContext,
      unsubscribeArgs,
    );
    expect(contact.subscriptionStatus).toBe("unsubscribed");
  });

  it("does not bind an unrelated transactional template", async () => {
    vi.stubEnv(
      "LOOPS_EMAIL_CONFIRMATION_TRANSACTIONAL_ID",
      "confirmation_template",
    );
    const operation = {
      _id: "operation_1",
      contactId: "contact_1",
      createdAt: eventAt - 1_000,
      deliveryStatus: "pending",
      kind: "transactional",
      status: "claimed",
      transactionalTemplateKey: "email-confirmation",
      updatedAt: eventAt,
    };
    const ctx = createContext({ operation });

    await expect(
      getHandler(reconcileLoopsWebhookEvent)(ctx, {
        ...baseArgs,
        eventName: "transactional.email.sent",
        mailingListId: null,
        providerEmailId: "unrelated_email",
        providerEmailMessageId: "unrelated_version",
        providerSourceId: "other_transactional_template",
        sourceType: "transactional",
      }),
    ).resolves.toEqual({ status: "ignoredUnlinked" });
    expect(ctx.db.patch).not.toHaveBeenCalledWith(
      "operation_1",
      expect.objectContaining({ providerMessageId: "unrelated_email" }),
    );
  });
});
