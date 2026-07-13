export type NotionKitTemplate = {
  columns: readonly string[];
  description: string;
  fileName: string;
  name: string;
  propertyNotes: readonly string[];
  rows: readonly (readonly string[])[];
};
