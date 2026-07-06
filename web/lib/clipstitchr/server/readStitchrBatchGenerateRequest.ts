import type { AutomationStitchrColorChoice } from "@/lib/clipstitchr/types/AutomationStitchrColorChoice";
import type { AutomationStitchrTextStyleChoice } from "@/lib/clipstitchr/types/AutomationStitchrTextStyleChoice";
import { getAutomationStitchrColorChoice } from "@/lib/clipstitchr/utils/getAutomationStitchrColorChoice";
import { getAutomationStitchrTextStyleChoice } from "@/lib/clipstitchr/utils/getAutomationStitchrTextStyleChoice";

type StitchrBatchGenerateRequest = {
  stitchrTextBackgroundColorChoice?: AutomationStitchrColorChoice;
  stitchrTextColorChoice?: AutomationStitchrColorChoice;
  stitchrTextStrokeColorChoice?: AutomationStitchrColorChoice;
  stitchrTextStyleChoice?: AutomationStitchrTextStyleChoice;
  productId?: string;
  soundTrackId?: string;
  templateId?: string;
  timeZone?: string;
};

export async function readStitchrBatchGenerateRequest(
  request: Request,
): Promise<StitchrBatchGenerateRequest> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return {};
  }

  const body = (await request.json().catch(() => null)) as unknown;

  if (!body || typeof body !== "object") {
    return {};
  }

  const {
    stitchrTextBackgroundColorChoice,
    stitchrTextColorChoice,
    stitchrTextStrokeColorChoice,
    stitchrTextStyleChoice,
    productId,
    soundTrackId,
    templateId,
    timeZone,
  } = body as Record<string, unknown>;
  const normalizedProductId =
    typeof productId === "string" ? productId.trim() : "";
  const normalizedSoundTrackId =
    typeof soundTrackId === "string" ? soundTrackId.trim() : "";
  const normalizedTemplateId =
    typeof templateId === "string" ? templateId.trim() : "";
  const normalizedTimeZone =
    typeof timeZone === "string" ? timeZone.trim().slice(0, 128) : "";
  const input: StitchrBatchGenerateRequest = {
    ...(typeof stitchrTextBackgroundColorChoice === "string"
      ? {
          stitchrTextBackgroundColorChoice: getAutomationStitchrColorChoice(
            stitchrTextBackgroundColorChoice,
          ),
        }
      : {}),
    ...(typeof stitchrTextColorChoice === "string"
      ? {
          stitchrTextColorChoice: getAutomationStitchrColorChoice(
            stitchrTextColorChoice,
          ),
        }
      : {}),
    ...(typeof stitchrTextStrokeColorChoice === "string"
      ? {
          stitchrTextStrokeColorChoice: getAutomationStitchrColorChoice(
            stitchrTextStrokeColorChoice,
          ),
        }
      : {}),
    ...(typeof stitchrTextStyleChoice === "string"
      ? {
          stitchrTextStyleChoice: getAutomationStitchrTextStyleChoice(
            stitchrTextStyleChoice,
          ),
        }
      : {}),
    ...(normalizedProductId ? { productId: normalizedProductId } : {}),
    ...(normalizedTemplateId ? { templateId: normalizedTemplateId } : {}),
    ...(normalizedSoundTrackId ? { soundTrackId: normalizedSoundTrackId } : {}),
    ...(normalizedTimeZone ? { timeZone: normalizedTimeZone } : {}),
  };

  return input;
}
