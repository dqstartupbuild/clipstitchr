export type TikTokEventValue =
  | boolean
  | number
  | string
  | null
  | TikTokEventValue[]
  | {
      [key: string]: TikTokEventValue | undefined;
    };

export type TikTokEventPayload = Record<string, TikTokEventValue | undefined>;
