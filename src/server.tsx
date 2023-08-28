import React from 'react';
import ReactDOMServer from 'react-dom/server';

import { ScrollableContent } from './ScrollableContent';
import { ScrollbarProvider } from './scrollbar';

export const render = () =>
  ReactDOMServer.renderToString(
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
  );
