import type { LoopsClient } from "loops";

type DeleteLoopsContactOptions = Readonly<{
  client: Pick<LoopsClient, "deleteContact">;
  providerContactKey: string;
}>;

export function deleteLoopsContact({
  client,
  providerContactKey,
}: DeleteLoopsContactOptions) {
  return client.deleteContact({ userId: providerContactKey });
}
