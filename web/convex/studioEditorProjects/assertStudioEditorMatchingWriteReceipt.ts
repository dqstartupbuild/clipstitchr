import type { Doc } from "../_generated/dataModel";

export function assertStudioEditorMatchingWriteReceipt(
  receipt: Doc<"studioEditorProjectWriteReceipts">,
  expected: {
    projectId: string;
    productId: string;
    operation: Doc<"studioEditorProjectWriteReceipts">["operation"];
    requestFingerprint: string;
  },
) {
  if (
    receipt.projectId !== expected.projectId ||
    receipt.productId !== expected.productId ||
    receipt.operation !== expected.operation ||
    receipt.requestFingerprint !== expected.requestFingerprint
  ) {
    throw new Error(
      "Idempotency key was reused with a different Studio editor write.",
    );
  }
  return receipt;
}
