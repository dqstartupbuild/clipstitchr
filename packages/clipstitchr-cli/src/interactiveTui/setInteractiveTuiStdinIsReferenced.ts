type InteractiveTuiStdin = {
  isTTY?: boolean;
  ref: () => unknown;
  resume: () => unknown;
  unref: () => unknown;
};

export function setInteractiveTuiStdinIsReferenced(input: {
  isReferenced: boolean;
  stdin?: InteractiveTuiStdin;
}) {
  const stdin = input.stdin ?? process.stdin;

  if (!stdin.isTTY) {
    return;
  }

  if (input.isReferenced) {
    stdin.ref();
    stdin.resume();
    return;
  }

  stdin.unref();
}
