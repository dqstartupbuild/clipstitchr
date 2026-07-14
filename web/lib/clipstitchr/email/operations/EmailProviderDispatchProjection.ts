import type { LeadSegment } from "../contact/LeadSegment";
import type { LeadStage } from "../contact/LeadStage";
import type { PublicToolGateMode } from "../../tools/catalog/PublicToolGateMode";
import type { PublicToolKey } from "../../tools/catalog/PublicToolKey";

export type EmailProviderDispatchProjection = Readonly<{
  confirmation: Readonly<{
    expiresAt: number;
    generation: number;
    tokenDigest: string;
    tokenRecordId: string;
  }> | null;
  contact: Readonly<{
    contactName: string;
    firstTool?: PublicToolKey;
    latestTool?: PublicToolKey;
    leadSegment: LeadSegment;
    leadStage: LeadStage;
    normalizedEmail: string;
    providerContactKey: string;
  }>;
  operation: Readonly<{
    kind:
      | "contactDelete"
      | "contactSync"
      | "contactResubscribe"
      | "contactUnsubscribe"
      | "workflowEvent"
      | "transactional";
    operationId: string;
  }>;
  transactionalTemplateKey: string | null;
  workflow: Readonly<{
    gateMode?: PublicToolGateMode;
    leadSegment?: LeadSegment;
    toolSource?: PublicToolKey;
    workflowKey: string;
    workflowVersion: "v1";
  }> | null;
}>;
