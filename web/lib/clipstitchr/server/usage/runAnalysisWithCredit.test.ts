import { describe, expect, it, vi } from "vitest";
import { runAnalysisWithCredit } from "./runAnalysisWithCredit";

describe("runAnalysisWithCredit", () => {
  it("commits one successful analysis reservation", async () => {
    const mutation = vi
      .fn()
      .mockResolvedValueOnce({ reservationId: "creation:analysis-1" })
      .mockResolvedValueOnce({ state: "committed" });

    await expect(
      runAnalysisWithCredit({
        client: { mutation } as never,
        operation: "ai_analysis",
        secret: "rate-secret",
        work: async () => "analysis",
      }),
    ).resolves.toBe("analysis");

    expect(mutation).toHaveBeenCalledTimes(2);
    expect(mutation.mock.calls[0]?.[1]).toMatchObject({
      operation: "ai_analysis",
      secret: "rate-secret",
    });
    expect(mutation.mock.calls[1]?.[1]).toMatchObject({
      operation: "ai_analysis",
      reservationId: "creation:analysis-1",
    });
  });

  it("releases the reservation when analysis fails", async () => {
    const mutation = vi
      .fn()
      .mockResolvedValueOnce({ reservationId: "creation:analysis-2" })
      .mockResolvedValueOnce({ state: "released" });

    await expect(
      runAnalysisWithCredit({
        client: { mutation } as never,
        operation: "hook_lab_analysis",
        secret: "rate-secret",
        work: async () => {
          throw new Error("provider failed");
        },
      }),
    ).rejects.toThrow("provider failed");

    expect(mutation).toHaveBeenCalledTimes(2);
    expect(mutation.mock.calls[1]?.[1]).toMatchObject({
      reason: "AI analysis did not finish.",
      reservationId: "creation:analysis-2",
    });
  });
});
