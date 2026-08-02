export const textSlicer = (
  _integrationType: string,
  end: number,
  _text: string
): { start: number; end: number } => {
  return {
    start: 0,
    end,
  };
};
