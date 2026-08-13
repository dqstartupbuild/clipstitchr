export interface TikTokWebhookReplayProtector {
  claim(dedupeKey: string, ttlMilliseconds: number): Promise<boolean>;
}
