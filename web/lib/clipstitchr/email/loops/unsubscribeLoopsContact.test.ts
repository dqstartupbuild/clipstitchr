import type { LoopsClient } from "loops";
import { describe, expect, it, vi } from "vitest";
import { unsubscribeLoopsContact } from "./unsubscribeLoopsContact";

describe("unsubscribeLoopsContact", () => {
  it("uses only the canonical opaque provider key for compensation", async () => {
    const client = {
      updateContact: vi.fn().mockResolvedValue({ success: true }),
    } as unknown as Pick<LoopsClient, "updateContact">;

    await unsubscribeLoopsContact({
      client,
      providerContactKey: "provider_opaque_key",
    });

    expect(client.updateContact).toHaveBeenCalledWith({
      properties: { subscribed: false },
      userId: "provider_opaque_key",
    });
  });
});
