export class AppHookGeneratorInputError extends Error {
  constructor() {
    super("Invalid App Hook Generator input.");
    this.name = "AppHookGeneratorInputError";
  }
}
