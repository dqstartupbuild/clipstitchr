import { NextResponse } from "next/server";
import type { Prediction } from "replicate";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { fetchReplicateOutput } from "@/lib/clipstitchr/server/fetchReplicateOutput";
import { getReplicateOutputUrl } from "@/lib/clipstitchr/server/getReplicateOutputUrl";
import { getSwaprFormFile } from "@/lib/clipstitchr/server/getSwaprFormFile";
import { getSwaprFormString } from "@/lib/clipstitchr/server/getSwaprFormString";

export const runtime = "nodejs";

const SWAPR_OUTPAINT_MODEL_ID = "black-forest-labs/flux-fill-pro";
const SWAPR_OUTPAINT_PROMPT =
  [
    "No text of any kind anywhere in the generated image.",
    "Do not generate letters, words, numbers, captions, signs, labels, handwriting, typography, subtitles, UI text, menu text, posters, stickers, watermarks, or gibberish.",
    "If an outpainted area could contain text, replace it with plain texture, wall, floor, fabric, sky, furniture, or natural background instead.",
    "Realistic photo outpainting only.",
    "Extend the existing location, room, wall, floor, sky, street, furniture, clothing edges, hair edges, and natural body context into the masked area.",
    "Continue the exact environment from the unmasked photo with matching lighting, perspective, lens, shadows, color, texture, and camera quality.",
    "Preserve the person and all unmasked pixels exactly.",
    "Do not create a social media post, phone screen, app interface, web page, poster, collage, frame, border, caption, text, logo, watermark, icon, button, notification, username, like bar, comment bar, screenshot, graphic design, product card, or template.",
    "Do not add random objects. Fill only plausible real-world background and natural continuation of the scene.",
  ].join(" ");

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = getSwaprFormFile(formData, "image");
    const mask = getSwaprFormFile(formData, "mask");
    const prompt =
      getSwaprFormString(formData, "prompt").trim() || SWAPR_OUTPAINT_PROMPT;
    const replicate = createReplicateClient();
    const prediction = await replicate.predictions.create({
      model: SWAPR_OUTPAINT_MODEL_ID,
      input: {
        image,
        mask,
        prompt,
        steps: 40,
        guidance: 55,
        safety_tolerance: 2,
        prompt_upsampling: false,
        output_format: "jpg",
      },
    });
    const completedPrediction = await replicate.wait(prediction, {
      interval: 2000,
    });

    if (completedPrediction.status !== "succeeded") {
      throw new Error(
        typeof completedPrediction.error === "string"
          ? completedPrediction.error
          : "Replicate did not complete photo expansion.",
      );
    }

    const outputUrl = getReplicateOutputUrl(
      (completedPrediction as Prediction).output,
    );
    const outputResponse = await fetchReplicateOutput(outputUrl);
    const headers = new Headers();
    const contentType = outputResponse.headers.get("content-type");

    headers.set("content-type", contentType ?? "image/jpeg");

    return new NextResponse(outputResponse.body, { headers });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Unable to expand this Swapr photo.",
      },
      { status: 500 },
    );
  }
}
