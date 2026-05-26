export const clampIndex = (index: number, frameCount: number): number => {
  if (frameCount <= 0) return 0;
  if (index < 0) return 0;
  if (index > frameCount - 1) return frameCount - 1;
  return index;
};

export const isAtStart = (index: number): boolean => index <= 0;

export const isAtEnd = (index: number, frameCount: number): boolean =>
  index >= frameCount - 1;

export const frameProgress = (index: number, frameCount: number): number => {
  if (frameCount <= 1) return 0;
  return index / (frameCount - 1);
};
