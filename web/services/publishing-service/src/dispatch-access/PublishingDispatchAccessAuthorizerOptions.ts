export type PublishingDispatchAccessAuthorizerOptions = Readonly<{
  appOrigin: string;
  secret: string;
  fetchImplementation?: typeof fetch;
}>;
