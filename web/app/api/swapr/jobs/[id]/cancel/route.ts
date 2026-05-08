import { NextResponse } from "next/server";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createSwaprPredictionJson } from "@/lib/clipstitchr/server/createSwaprPredictionJson";
import { getRequestReplicateToken } from "@/lib/clipstitchr/server/getRequestReplicateToken";

export const runtime = "nodejs";

type SwaprCancelRouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: Request,
  { params }: SwaprCancelRouteContext,
) {
  try {
    const { id } = await params;
    const replicate = createReplicateClient(getRequestReplicateToken(request));
    const prediction = await replicate.predictions.cancel(id);

    return NextResponse.json(createSwaprPredictionJson(prediction));
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to cancel Swapr prediction.",
      },
      { status: 500 },
    );
  }
}
