import React from 'react';
import ReactDOM from 'react-dom';

import { ScrollableContent } from './ScrollableContent';
import { ScrollbarProvider } from './scrollbar';

ReactDOM.hydrate(
  <div
    style={{
      height: '600px',
      maxHeight: '600px',
      width: '600px',
    }}
  >
    <ScrollbarProvider forceVisible="y">
      <ScrollableContent />
    </ScrollbarProvider>
  </div>,
  document.getElementById('root')!,
);
