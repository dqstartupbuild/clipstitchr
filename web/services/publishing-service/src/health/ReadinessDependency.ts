export type ReadinessDependency = Readonly<{
  name: string;
  check: () => Promise<void>;
}>;
