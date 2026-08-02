export interface OAuthAuthorizationStateStore {
  create(storageKey: string, value: string, ttlMilliseconds: number): Promise<boolean>;
  consume(storageKey: string): Promise<string | null>;
}
