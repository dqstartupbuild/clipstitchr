import type { LoopsClient } from "loops";

type UnsubscribeLoopsContactOptions = Readonly<{
  client: Pick<LoopsClient, "updateContact">;
  providerContactKey: string;
}>;

export function unsubscribeLoopsContact({
  client,
  providerContactKey,
}: UnsubscribeLoopsContactOptions) {
  return client.updateContact({
    userId: providerContactKey,
    properties: { subscribed: false },
  });
}
