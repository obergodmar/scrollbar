import { CSSProperties } from 'react';

import { ScrollbarOptions } from 'options';

export function applyContentStyles(options: ScrollbarOptions): CSSProperties {
  return {
    width: options['overflowX'] === 'hidden' ? '100%' : 'min-content',
    height: options['overflowY'] === 'hidden' ? '100%' : 'min-content',
  };
}
