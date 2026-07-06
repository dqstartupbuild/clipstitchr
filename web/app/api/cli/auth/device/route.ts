import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/clipstitchr/server/convex/createConvexHttpClient";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { cliDeviceAuthorizationExpiresInSeconds } from "@/lib/clipstitchr/server/cli/cliDeviceAuthorizationExpiresInSeconds";
import { cliDeviceAuthorizationPollIntervalSeconds } from "@/lib/clipstitchr/server/cli/cliDeviceAuthorizationPollIntervalSeconds";
import { createCliClientRateLimitKey } from "@/lib/clipstitchr/server/cli/createCliClientRateLimitKey";
import { createCliDeviceCode } from "@/lib/clipstitchr/server/cli/createCliDeviceCode";
import { createCliTokenHash } from "@/lib/clipstitchr/server/cli/createCliTokenHash";
import { createCliUserCode } from "@/lib/clipstitchr/server/cli/createCliUserCode";
import { createIsoDateAfterSeconds } from "@/lib/clipstitchr/server/cli/createIsoDateAfterSeconds";
import { readCliJsonObject } from "@/lib/clipstitchr/server/cli/readCliJsonObject";
import { readCliOptionalString } from "@/lib/clipstitchr/server/cli/readCliOptionalString";
import { createId } from "@/lib/clipstitchr/utils/createId";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await readCliJsonObject(request);
    const now = new Date();
    const createdAt = now.toISOString();
    const deviceCode = createCliDeviceCode();
    const userCode = createCliUserCode();
    const verificationUri = new URL("/cli/connect", request.url);
    const verificationUriComplete = new URL(verificationUri);

    verificationUriComplete.searchParams.set("code", userCode);

    const convex = createConvexHttpClient();

    await convex.mutation(
      api.cliAuth.createDeviceAuthorization.createDeviceAuthorization,
      {
        clientKey: createCliClientRateLimitKey(request),
        clientName: readCliOptionalString(body, "clientName"),
        createdAt,
        deviceCodeHash: createCliTokenHash(deviceCode),
        expiresAt: createIsoDateAfterSeconds(
          now,
          cliDeviceAuthorizationExpiresInSeconds,
        ),
        id: createId(),
        machineName: readCliOptionalString(body, "machineName"),
        secret: getRateLimitApiSecret(),
        userCode,
      },
    );

    return NextResponse.json({
      deviceCode,
      expiresIn: cliDeviceAuthorizationExpiresInSeconds,
      interval: cliDeviceAuthorizationPollIntervalSeconds,
      userCode,
      verificationUri: verificationUri.toString(),
      verificationUriComplete: verificationUriComplete.toString(),
    });
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
            : "Unable to start CLI sign in.",
      },
      { status: 400 },
    );
  }
}
