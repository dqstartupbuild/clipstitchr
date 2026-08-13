import type { StudioBetaAuditEventType } from "../../lib/clipstitchr/types/StudioBetaAuditEventType";
import type { MutationCtx } from "../_generated/server";

type RecordStudioBetaAuditEventInput = {
  actorId: string;
  eventType: StudioBetaAuditEventType;
  now: string;
  ownerId: string;
  reason?: string;
};

export async function recordStudioBetaAuditEvent(
  ctx: MutationCtx,
  input: RecordStudioBetaAuditEventInput,
) {
  return await ctx.db.insert("studioBetaAuditEvents", {
    ownerId: input.ownerId,
    actorId: input.actorId,
    eventType: input.eventType,
    reason: input.reason,
    createdAt: input.now,
  });
}
