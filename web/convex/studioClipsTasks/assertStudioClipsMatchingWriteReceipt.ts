import type { Doc } from "../_generated/dataModel";

export function assertStudioClipsMatchingWriteReceipt(
  receipt: Doc<"studioClipsWriteReceipts">,
  expected: {
    operation: Doc<"studioClipsWriteReceipts">["operation"];
    productId: string;
    requestFingerprint: string;
    targetId: string;
  },
) {
  if (
    receipt.operation !== expected.operation ||
    receipt.productId !== expected.productId ||
    receipt.requestFingerprint !== expected.requestFingerprint ||
    receipt.targetId !== expected.targetId
  ) {
    throw new Error("Idempotency key was reused with a different Studio Clips write.");
  }
  return receipt;
}
