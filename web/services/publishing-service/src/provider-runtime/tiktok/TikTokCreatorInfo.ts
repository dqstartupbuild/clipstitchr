export type TikTokCreatorInfo = Readonly<{
  fetchedAtEpochMilliseconds: number;
  username: string | undefined;
  nickname: string | undefined;
  privacyLevelOptions: readonly string[];
  commentsDisabled: boolean;
  duetDisabled: boolean;
  stitchDisabled: boolean;
  maxVideoDurationSeconds: number;
}>;
