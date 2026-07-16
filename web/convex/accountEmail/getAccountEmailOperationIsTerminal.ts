export function getAccountEmailOperationIsTerminal(status: string) {
  return (
    status === "accepted" ||
    status === "delivered" ||
    status === "canceled" ||
    status === "superseded" ||
    status === "deadLetter"
  );
}
