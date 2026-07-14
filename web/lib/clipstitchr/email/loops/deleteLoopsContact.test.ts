import type { LoopsClient } from "loops";
import { describe, expect, it, vi } from "vitest";
import { deleteLoopsContact } from "./deleteLoopsContact";

describe("deleteLoopsContact", () => {
  it("deletes by only the canonical opaque provider key", async () => {
    const client = {
      deleteContact: vi.fn().mockResolvedValue({
        message: "Contact deleted.",
        success: true,
      }),
    } as unknown as Pick<LoopsClient, "deleteContact">;

    await deleteLoopsContact({
      client,
      providerContactKey: "provider_opaque_key",
    });

    expect(client.deleteContact).toHaveBeenCalledWith({
      userId: "provider_opaque_key",
    });
  });
});
