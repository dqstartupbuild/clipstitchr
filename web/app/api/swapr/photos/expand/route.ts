import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createAuthenticationRequiredResponse } from "@/lib/clipstitchr/server/createAuthenticationRequiredResponse";
import { createAuthenticatedConvexHttpClient } from "@/lib/clipstitchr/server/convex/createAuthenticatedConvexHttpClient";
import { getAuthenticatedConvexToken } from "@/lib/clipstitchr/server/convex/getAuthenticatedConvexToken";
import { getAuthenticatedUserId } from "@/lib/clipstitchr/server/getAuthenticatedUserId";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";
import { getRateLimitApiSecret } from "@/lib/clipstitchr/server/rateLimits/getRateLimitApiSecret";
import { createR2ObjectKey } from "@/lib/clipstitchr/server/r2/createR2ObjectKey";
import { deleteR2Object } from "@/lib/clipstitchr/server/r2/deleteR2Object";
import { deleteR2Objects } from "@/lib/clipstitchr/server/r2/deleteR2Objects";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import { putR2Object } from "@/lib/clipstitchr/server/r2/putR2Object";
import { getSwaprFormFile } from "@/lib/clipstitchr/server/getSwaprFormFile";
import { getSwaprFormString } from "@/lib/clipstitchr/server/getSwaprFormString";
import { waitForProviderJob } from "@/lib/clipstitchr/server/waitForProviderJob";
import { createId } from "@/lib/clipstitchr/utils/createId";
import type { ConvexHttpClient } from "convex/browser";

export const runtime = "nodejs";

const SWAPR_OUTPAINT_PROMPT = [
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
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    return createAuthenticationRequiredResponse();
  }

  const inputKeys: string[] = [];
  let convex: ConvexHttpClient | null = null;
  let jobQueued = false;
  let reservationId: string | null = null;

  try {
    const convexToken = await getAuthenticatedConvexToken();

    if (!convexToken) {
      throw new Error("Unable to create a Convex auth token.");
    }

    convex = createAuthenticatedConvexHttpClient(convexToken);
    const secret = getRateLimitApiSecret();

    await convex.mutation(api.rateLimits.consumeSwaprPhotoExpand, { secret });

    const formData = await request.formData();
    const image = getSwaprFormFile(formData, "image");
    const mask = getSwaprFormFile(formData, "mask");
    const customPrompt = getSwaprFormString(formData, "prompt").trim();
    const prompt = customPrompt
      ? `${SWAPR_OUTPAINT_PROMPT} ${customPrompt}`
      : SWAPR_OUTPAINT_PROMPT;
    const outputRecordId = createId();
    const providerJobId = `provider:swapr-photo-expansion:${outputRecordId}`;
    const createdAt = new Date().toISOString();
    const reservation = await convex.mutation(
      api.usage.reserveCreationCredits.reserveCreationCredits,
      {
        domainId: providerJobId,
        domainKind: "provider_job",
        idempotencyKey: `photo-expansion:${userId}:${outputRecordId}`,
        now: createdAt,
        operation: "photo_expansion",
        reservationKind: "worker",
      },
    );

    reservationId = reservation.reservationId;
    await convex.mutation(api.rateLimits.consumeR2Upload, {
      secret,
      sizeBytes: image.size + mask.size,
    });

    const [imageObject, maskObject] = await Promise.all(
      [
        { file: image, recordId: `${outputRecordId}:image` },
        { file: mask, recordId: `${outputRecordId}:mask` },
      ].map(async ({ file, recordId }) => {
        const contentType = file.type || "image/png";
        const object = await putR2Object({
          body: await file.arrayBuffer(),
          contentType,
          key: createR2ObjectKey({
            contentType,
            kind: "provider-input-image",
            recordId,
            userId,
          }),
        });

        inputKeys.push(object.key);
        return object;
      }),
    );

    try {
      await convex.mutation(api.providerJobs.create, {
        secret,
        ownerId: userId,
        id: providerJobId,
        jobType: "swapr-photo-expansion",
        stage: "awaiting-provider",
        idempotencyKey: `${userId}:swapr-photo-expansion:${outputRecordId}`,
        inputSnapshotJson: JSON.stringify({
          imageObject,
          maskObject,
          outputRecordId,
          prompt,
        }),
        usageReservationId: reservationId ?? undefined,
        createdAt,
      });
      jobQueued = true;
    } catch (error) {
      await deleteR2Objects(inputKeys).catch(() => null);

      if (reservationId) {
        await convex.mutation(
          api.usage.cancelUsageReservation.cancelUsageReservation,
          {
            now: new Date().toISOString(),
            reason: "Photo expansion job could not be queued",
            reservationId,
          },
        );
      }
      throw error;
    }

    const job = await waitForProviderJob(convex, providerJobId);
    const outputKey = job.outputAssetIds[0];

    if (!outputKey) {
      throw new Error("Photo expansion finished without an image.");
    }

    await convex.mutation(api.rateLimits.consumeR2Download, { secret });
    const signed = await getR2DownloadSignedUrl(outputKey);
    const output = await fetch(signed.url);

    if (!output.ok) {
      throw new Error("Unable to download the expanded photo.");
    }

    const result = await output.arrayBuffer();
    const contentType = output.headers.get("content-type") ?? "image/jpeg";

    await deleteR2Object(outputKey).catch(() => null);

    return new NextResponse(result, {
      headers: { "content-type": contentType },
    });
  } catch (error) {
    if (!jobQueued) {
      await deleteR2Objects(inputKeys).catch(() => null);

      if (convex && reservationId) {
        await convex
          .mutation(api.usage.cancelUsageReservation.cancelUsageReservation, {
            now: new Date().toISOString(),
            reason: "Photo expansion did not reach the queue",
            reservationId,
          })
          .catch(() => null);
      }
    }

    const rateLimitResponse = createRateLimitExceededResponse(error);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

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
