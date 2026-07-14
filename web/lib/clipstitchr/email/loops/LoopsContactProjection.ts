import type { LeadSegment } from "../contact/LeadSegment";
import type { LeadStage } from "../contact/LeadStage";

export type LoopsContactProjection = Readonly<{
  contactName: string;
  email: string;
  firstTool: string;
  latestTool: string;
  leadSegment: LeadSegment;
  leadStage: LeadStage;
  providerContactKey: string;
}>;
