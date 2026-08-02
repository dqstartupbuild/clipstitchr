export type RedisSetIfAbsentOptions = Readonly<{
  NX: true;
  PX: number;
}>;
