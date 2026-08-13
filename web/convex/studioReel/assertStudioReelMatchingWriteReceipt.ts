import type { Doc } from "../_generated/dataModel";

export function assertStudioReelMatchingWriteReceipt(
  receipt: Doc<"studioReelWriteReceipts">,
  expected: {
    readonly productId: string;
    readonly operation: Doc<"studioReelWriteReceipts">["operation"];
    readonly requestFingerprint: string;
  },
) {
  if (
    receipt.productId !== expected.productId ||
    receipt.operation !== expected.operation ||
    receipt.requestFingerprint !== expected.requestFingerprint
  ) {
    throw new Error("Idempotency key was reused with different Studio Stitch input.");
  }
}
