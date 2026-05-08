import { NextResponse } from "next/server";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createSwaprPredictionJson } from "@/lib/clipstitchr/server/createSwaprPredictionJson";

export const runtime = "nodejs";

type SwaprJobRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  { params }: SwaprJobRouteContext,
) {
  try {
    const { id } = await params;
    const replicate = createReplicateClient();
    const prediction = await replicate.predictions.get(id);

    return NextResponse.json(createSwaprPredictionJson(prediction));
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to load Swapr prediction.",
      },
      { status: 500 },
    );
  }
}
