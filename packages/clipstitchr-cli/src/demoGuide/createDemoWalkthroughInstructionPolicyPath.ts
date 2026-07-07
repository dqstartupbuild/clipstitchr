import { dirname, extname, join, basename } from "node:path";

export function createDemoWalkthroughInstructionPolicyPath(
  instructionsPath: string,
) {
  const extension = extname(instructionsPath);
  const name = extension
    ? basename(instructionsPath, extension)
    : basename(instructionsPath);

  return join(dirname(instructionsPath), `${name}-policy.json`);
}
