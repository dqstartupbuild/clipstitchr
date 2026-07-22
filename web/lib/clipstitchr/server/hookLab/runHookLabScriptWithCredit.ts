import type { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import { createId } from "@/lib/clipstitchr/utils/createId";

export async function runHookLabScriptWithCredit<Result>({
  client,
  secret,
  work,
}: {
  client: ConvexHttpClient;
  secret: string;
  work: () => Promise<Result>;
}) {
  const domainId = createId();
  const reservation = await client.mutation(
    anyApi.usage.reserveAnalysisCredit.reserveAnalysisCredit,
    {
      domainId,
      idempotencyKey: `hook-lab-script:${domainId}`,
      now: new Date().toISOString(),
      operation: "hook_lab_script",
      secret,
    },
  );
  let result: Result;

  try {
    result = await work();
  } catch (error) {
    if (reservation?.reservationId) {
      await client
        .mutation(anyApi.usage.releaseAnalysisCredit.releaseAnalysisCredit, {
          now: new Date().toISOString(),
          reason: "Hook Lab script generation did not finish.",
          reservationId: reservation.reservationId,
          secret,
        })
        .catch(() => undefined);
    }

    throw error;
  }

  if (reservation?.reservationId) {
    await client.mutation(
      anyApi.usage.commitAnalysisCredit.commitAnalysisCredit,
      {
        domainId,
        now: new Date().toISOString(),
        operation: "hook_lab_script",
        reservationId: reservation.reservationId,
        secret,
      },
    );
  }

  return result;
}
