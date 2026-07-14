import type { Doc } from "../_generated/dataModel";

export function getEmailProviderOperationIsTerminal(
  status: Doc<"emailProviderOperations">["status"],
) {
  return (
    status === "accepted" ||
    status === "delivered" ||
    status === "canceled" ||
    status === "superseded" ||
    status === "deadLetter"
  );
}
