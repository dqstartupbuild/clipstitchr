export type SlashCommandOptions = {
  options: Record<string, boolean | string | undefined>;
  positionals: string[];
};
