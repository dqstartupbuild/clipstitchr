import { NextResponse } from "next/server";
import { createReplicateClient } from "@/lib/clipr/server/createReplicateClient";
import { createSwaprPredictionJson } from "@/lib/clipr/server/createSwaprPredictionJson";

export const runtime = "nodejs";

type SwaprCancelRouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  _request: Request,
  { params }: SwaprCancelRouteContext,
) {
  try {
    const { id } = await params;
    const replicate = createReplicateClient();
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
