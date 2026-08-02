export type ProviderHttpResponse = Readonly<{
  status: number;
  headers: Readonly<Record<string, string | undefined>>;
  body: unknown;
}>;
