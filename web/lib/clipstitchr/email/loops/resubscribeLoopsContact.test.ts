import type { LoopsClient } from "loops";
import { describe, expect, it, vi } from "vitest";
import { resubscribeLoopsContact } from "@/lib/clipstitchr/email/loops/resubscribeLoopsContact";

describe("resubscribeLoopsContact", () => {
  it("sets subscribed only through the dedicated re-consent operation", async () => {
    const updateContact = vi.fn().mockResolvedValue({
      success: true,
      id: "loops_contact",
    });

    await resubscribeLoopsContact({
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

    expect(updateContact.mock.calls[0]?.[0]?.properties).toMatchObject({
      subscribed: true,
    });
  });
});
