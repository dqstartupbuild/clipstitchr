import { studioClipsLocalMediaProtocolArgs } from "./studioClipsLocalMediaProtocolArgs";

export function addStudioClipsLocalProtocolGuards(
  args: readonly string[],
): string[] {
  return args.flatMap((argument) =>
    argument === "-i"
      ? [...studioClipsLocalMediaProtocolArgs, argument]
      : [argument],
  );
}
