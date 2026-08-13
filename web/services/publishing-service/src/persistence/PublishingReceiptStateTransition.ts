import type {
  ClipPublishingInternalState,
  ClipPublishingPostDisposition,
  State,
} from "@prisma/client";

export type PublishingReceiptStateTransition = Readonly<{
  internalState: ClipPublishingInternalState;
  disposition: ClipPublishingPostDisposition;
  postState: State;
}>;
