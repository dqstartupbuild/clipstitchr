import type { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import { createId } from "@/lib/clipstitchr/utils/createId";

export async function runAnalysisWithCredit<Result>({
  client,
  operation,
  secret,
  work,
}: {
  client: ConvexHttpClient;
  operation: "ai_analysis" | "hook_lab_analysis";
  secret: string;
  work: () => Promise<Result>;
}) {
  const domainId = createId();
  const idempotencyKey = `analysis:${domainId}`;
  const reservation = await client.mutation(
    anyApi.usage.reserveAnalysisCredit.reserveAnalysisCredit,
    {
      domainId,
      idempotencyKey,
      now: new Date().toISOString(),
      operation,
      secret,
    },
  );

  try {
    const result = await work();

    if (reservation?.reservationId) {
      await client.mutation(
        anyApi.usage.commitAnalysisCredit.commitAnalysisCredit,
        {
          domainId,
          now: new Date().toISOString(),
          operation,
          reservationId: reservation.reservationId,
          secret,
        },
      );
    }

    return result;
  } catch (error) {
    if (reservation?.reservationId) {
      await client
        .mutation(anyApi.usage.releaseAnalysisCredit.releaseAnalysisCredit, {
          now: new Date().toISOString(),
          reason: "AI analysis did not finish.",
          reservationId: reservation.reservationId,
          secret,
        })
        .catch(() => undefined);
    }

    throw error;
  }
}
