import type { PublishingProvider } from "../../providers/PublishingProvider.js";

export type ProviderHttpRequest = Readonly<{
  provider: PublishingProvider;
  url: string;
  method: "GET" | "POST";
  headers?: Readonly<Record<string, string>>;
  body?: string;
}>;
