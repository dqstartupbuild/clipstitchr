import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { cliSessionExpiresInDays } from "@/lib/clipstitchr/server/cli/cliSessionExpiresInDays";
import { createCliClientRateLimitKey } from "@/lib/clipstitchr/server/cli/createCliClientRateLimitKey";
import { createCliSessionToken } from "@/lib/clipstitchr/server/cli/createCliSessionToken";
import { createCliTokenHash } from "@/lib/clipstitchr/server/cli/createCliTokenHash";
import { createIsoDateAfterDays } from "@/lib/clipstitchr/server/cli/createIsoDateAfterDays";
import { readCliJsonObject } from "@/lib/clipstitchr/server/cli/readCliJsonObject";
import { readCliRequiredString } from "@/lib/clipstitchr/server/cli/readCliRequiredString";
import { createId } from "@/lib/clipstitchr/utils/createId";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await readCliJsonObject(request);
    const deviceCode = readCliRequiredString(body, "deviceCode", "device code");
    const now = new Date();
    const accessToken = createCliSessionToken();
    const convex = createConvexHttpClient();
    const result = await convex.mutation(
      api.cliAuth.exchangeDeviceAuthorization.exchangeDeviceAuthorization,
      {
        clientKey: createCliClientRateLimitKey(request),
        deviceCodeHash: createCliTokenHash(deviceCode),
        exchangedAt: now.toISOString(),
        secret: getRateLimitApiSecret(),
        sessionExpiresAt: createIsoDateAfterDays(now, cliSessionExpiresInDays),
        sessionId: createId(),
        sessionTokenHash: createCliTokenHash(accessToken),
      },
    );

    if (result.status === "authorized") {
      return NextResponse.json({
        accessToken,
        expiresAt: result.expiresAt,
        sessionId: result.sessionId,
        tokenType: "Bearer",
      });
    }

    if (result.status === "authorization_pending") {
      return NextResponse.json({ status: result.status }, { status: 202 });
    }

    return NextResponse.json({ status: result.status }, { status: 400 });
  } catch (error) {
    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to finish CLI sign in.",
      },
      { status: 400 },
    );
  }
}
