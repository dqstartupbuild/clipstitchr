declare const providerTokenEnvelopeBrand: unique symbol;

export type ProviderTokenEnvelope = string & {
  readonly [providerTokenEnvelopeBrand]: "provider-token-envelope";
};
