import { CSSProperties } from 'react';

import { ScrollbarOptions } from 'options';

export function applyScrollableStyles(
  barWidth: number,
  { overflowX, overflowY }: ScrollbarOptions,
): CSSProperties {
  return {
    WebkitOverflowScrolling: 'touch',
    msOverflowStyle: '-ms-autohiding-scrollbar',
    width:
      overflowY !== 'hidden' && barWidth > 0
        ? `calc(100% + ${barWidth}px)`
        : '100%',
    height:
      overflowX !== 'hidden' && barWidth > 0
        ? `calc(100% + ${barWidth}px)`
        : '100%',
    maxWidth: 'inherit',
    maxHeight: 'inherit',
    overflowX: overflowX || 'auto',
    overflowY: overflowY || 'auto',
  };
}
