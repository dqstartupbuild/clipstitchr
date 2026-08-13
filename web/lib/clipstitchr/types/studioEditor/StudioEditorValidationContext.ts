export type StudioEditorValidationContext = {
  add: (path: string, code: string, message: string) => void;
  boundedString: (
    value: unknown,
    path: string,
    maximum?: number,
  ) => value is string;
  boundedNumber: (
    value: unknown,
    path: string,
    minimum: number,
    maximum: number,
  ) => value is number;
};
