import { api } from "@/convex/_generated/api";
import type { CliprJobCreateInput } from "@/lib/clipstitchr/server/clipr/CliprJobCreateInput";
import type { CliprJobServerContext } from "@/lib/clipstitchr/server/clipr/CliprJobServerContext";

type ConsumeCliprJobStartRateLimitsOptions = CliprJobServerContext & {
  input: CliprJobCreateInput;
};

export async function consumeCliprJobStartRateLimits({
  convex,
  input,
  secret,
}: ConsumeCliprJobStartRateLimitsOptions) {
  await convex.mutation(api.rateLimits.consumeCliprJobCreate, {
    estimatedSeconds: input.durationSeconds,
    secret,
  });

  if (input.generationMode === "script") {
    await convex.mutation(api.rateLimits.consumeCliprHookScript, { secret });
  }
}
