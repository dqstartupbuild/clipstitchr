import { NextResponse } from "next/server";
import { createReplicateClient } from "@/lib/clipr/server/createReplicateClient";
import { createSwaprPredictionJson } from "@/lib/clipr/server/createSwaprPredictionJson";
import { getSwaprCharacterOrientation } from "@/lib/clipr/server/getSwaprCharacterOrientation";
import { getSwaprFormBoolean } from "@/lib/clipr/server/getSwaprFormBoolean";
import { getSwaprFormFile } from "@/lib/clipr/server/getSwaprFormFile";
import { getSwaprFormString } from "@/lib/clipr/server/getSwaprFormString";
import { getSwaprMode } from "@/lib/clipr/server/getSwaprMode";

export const runtime = "nodejs";

const SWAPR_MODEL_ID = "kwaivgi/kling-v3-motion-control";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = getSwaprFormFile(formData, "image");
    const video = getSwaprFormFile(formData, "video");
    const prompt = getSwaprFormString(formData, "prompt").trim();
    const mode = getSwaprMode(getSwaprFormString(formData, "mode"));
    const characterOrientation = getSwaprCharacterOrientation(
      getSwaprFormString(formData, "characterOrientation"),
    );
    const keepOriginalSound = getSwaprFormBoolean(
      formData,
      "keepOriginalSound",
    );

    const replicate = createReplicateClient();
    const prediction = await replicate.predictions.create({
      model: SWAPR_MODEL_ID,
      input: {
        image,
        video,
        prompt,
        mode,
        keep_original_sound: keepOriginalSound,
        character_orientation: characterOrientation,
      },
    });

    return NextResponse.json(createSwaprPredictionJson(prediction));
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to create Swapr prediction.",
      },
      { status: 500 },
    );
  }
}
