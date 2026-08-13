export type CanonicalJsonValue =
  | boolean
  | number
  | string
  | null
  | readonly CanonicalJsonValue[]
  | Readonly<{ [key: string]: CanonicalJsonValue }>;
