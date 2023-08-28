export function calculateThumbStyles(
  scrollOffset: number,
  croppedSize: number,
  contentSize: number,
  barSize: { min: number; max: number },
): {
  size: number;
  position: number;
} {
  const positionRatio = scrollOffset / (contentSize - croppedSize);
  const sizeRatio = croppedSize / contentSize;

  let size = Math.max(~~(sizeRatio * croppedSize), barSize.min);
  if (barSize.max) {
    size = Math.min(size, barSize.max);
  }

  const position = ~~((croppedSize - size) * positionRatio);

  return {
    size,
    position,
  };
}
