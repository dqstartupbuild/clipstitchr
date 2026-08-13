export interface ServiceAssertionReplayProtector {
  consume(replayKey: string, expiresAtEpochMilliseconds: number): Promise<boolean>;
}
