import type { LoopsClient } from "loops";
import { describe, expect, it, vi } from "vitest";
import { upsertLoopsContact } from "@/lib/clipstitchr/email/loops/upsertLoopsContact";

describe("upsertLoopsContact", () => {
  it("uses an opaque user ID and omits subscription controls", async () => {
    const updateContact = vi.fn().mockResolvedValue({
      success: true,
      id: "loops_contact",
    });

    await upsertLoopsContact({
      client: { updateContact } as Pick<LoopsClient, "updateContact">,
      developmentRecipientList: "person@example.com",
      projection: {
        contactName: "Person Name",
        email: "person@example.com",
        firstTool: "app-hook-generator",
        latestTool: "app-hook-generator",
        leadSegment: "hooks-and-messaging",
        leadStage: "captured",
        providerContactKey: "provider_opaque_key",
      },
      teamEnvironment: "development",
    });

    expect(updateContact).toHaveBeenCalledWith({
      email: "person@example.com",
      userId: "provider_opaque_key",
      properties: {
        source: "ClipStitchr public tools",
        contactName: "Person Name",
        firstTool: "app-hook-generator",
        latestTool: "app-hook-generator",
        leadSegment: "hooks-and-messaging",
        leadStage: "captured",
      },
    });
    expect(updateContact.mock.calls[0]?.[0]).not.toHaveProperty("mailingLists");
    expect(updateContact.mock.calls[0]?.[0]?.properties).not.toHaveProperty(
      "subscribed",
    );
  });

  it("blocks a non-allowlisted development recipient before the SDK call", () => {
    const updateContact = vi.fn();

    expect(() =>
      upsertLoopsContact({
        client: { updateContact } as unknown as Pick<
          LoopsClient,
          "updateContact"
        >,
        developmentRecipientList: "safe@example.com",
        projection: {
          contactName: "Other Person",
          email: "other@example.com",
          firstTool: "app-hook-generator",
          latestTool: "app-hook-generator",
          leadSegment: "hooks-and-messaging",
          leadStage: "captured",
          providerContactKey: "provider_opaque_key",
        },
        teamEnvironment: "development",
      }),
    ).toThrow("Loops recipient is not allowed in this environment.");
    expect(updateContact).not.toHaveBeenCalled();
  });
});
