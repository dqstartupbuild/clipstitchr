import { describe, expect, it, vi } from "vitest";
import { runHookLabScriptWithCredit } from "./runHookLabScriptWithCredit";

describe("runHookLabScriptWithCredit", () => {
  it("reserves before work and commits after the saved result", async () => {
    const events: string[] = [];
    const mutation = vi
      .fn()
      .mockImplementationOnce(async (_reference, args) => {
        events.push(`reserve:${args.operation}`);
        return { reservationId: "creation:script-1" };
      })
      .mockImplementationOnce(async (_reference, args) => {
        events.push(`commit:${args.operation}`);
        return { state: "committed" };
      });

    await expect(
      runHookLabScriptWithCredit({
        client: { mutation } as never,
        secret: "rate-secret",
        work: async () => {
          events.push("script-saved");
          return "saved-script";
        },
      }),
    ).resolves.toBe("saved-script");

    expect(events).toEqual([
      "reserve:hook_lab_script",
      "script-saved",
      "commit:hook_lab_script",
    ]);
  });

  it("releases the reservation when script generation or saving fails", async () => {
    const mutation = vi
      .fn()
      .mockResolvedValueOnce({ reservationId: "creation:script-2" })
      .mockResolvedValueOnce({ state: "released" });

    await expect(
      runHookLabScriptWithCredit({
        client: { mutation } as never,
        secret: "rate-secret",
        work: async () => {
          throw new Error("save failed");
        },
      }),
    ).rejects.toThrow("save failed");

    expect(mutation.mock.calls[1]?.[1]).toMatchObject({
      reason: "Hook Lab script generation did not finish.",
      reservationId: "creation:script-2",
    });
  });

  it("keeps a saved script reserved when the commit call needs recovery", async () => {
    const mutation = vi
      .fn()
      .mockResolvedValueOnce({ reservationId: "creation:script-3" })
      .mockRejectedValueOnce(new Error("commit transport failed"));

    await expect(
      runHookLabScriptWithCredit({
        client: { mutation } as never,
        secret: "rate-secret",
        work: async () => "saved-script",
      }),
    ).rejects.toThrow("commit transport failed");

    expect(mutation).toHaveBeenCalledTimes(2);
  });
});
