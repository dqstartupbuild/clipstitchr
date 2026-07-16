import type { MutationCtx } from "../_generated/server";
import type { AccountEmailDataVariables } from "../../lib/clipstitchr/email/loops/AccountEmailDataVariables";
import type { AccountEmailTemplateKey } from "../../lib/clipstitchr/email/loops/AccountEmailTemplateKey";
import { createNotification } from "../createNotification";
import { enqueueAccountEmailOperation } from "./enqueueAccountEmailOperation";

export async function enqueueAccountCommunication(
  ctx: MutationCtx,
  args: {
    communicationKey: string;
    createdAt: string;
    dataVariables: AccountEmailDataVariables;
    message: string;
    ownerId: string;
    preview: string;
    sourceId: string;
    sourceType: "billing" | "credit";
    templateKey: AccountEmailTemplateKey;
    title: string;
  },
) {
  const dedupeKey = `account:${args.communicationKey}`;
  const [notificationId, email] = await Promise.all([
    createNotification(ctx, {
      createdAt: args.createdAt,
      dedupeKey,
      message: args.message,
      ownerId: args.ownerId,
      preview: args.preview,
      sourceId: args.sourceId,
      sourceType: args.sourceType,
      title: args.title,
    }),
    enqueueAccountEmailOperation(ctx, {
      communicationKey: args.communicationKey,
      dataVariables: args.dataVariables,
      now: Date.parse(args.createdAt),
      ownerId: args.ownerId,
      templateKey: args.templateKey,
    }),
  ]);

  return { email, notificationId };
}
