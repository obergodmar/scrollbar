import React from 'react';
import { createRoot } from 'react-dom/client';

import { ScrollableContent } from './ScrollableContent';
import { ScrollbarProvider } from './scrollbar';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <div
      style={{
        height: '500px',
        maxHeight: '500px',
        width: '600px',
      }}
    >
      <h2>Children as ReactNode:</h2>
      <ScrollbarProvider forceVisible="y">
        <ScrollableContent />
      </ScrollbarProvider>

      <h2>Children as RenderFunc:</h2>
      <ScrollbarProvider forceVisible="y">
        {({ scrollableRef, scrollableProps, contentRef, contentProps }) => (
          <div ref={scrollableRef} {...scrollableProps}>
            <div ref={contentRef} {...contentProps}>
              <ScrollableContent />
            </div>
          </div>
        )}
      </ScrollbarProvider>
    </div>
  </React.StrictMode>,
);
