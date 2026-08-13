export type StudioClipsJsonValue =
  | boolean
  | null
  | number
  | string
  | StudioClipsJsonValue[]
  | { [key: string]: StudioClipsJsonValue };
