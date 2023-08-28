declare global {
  interface Window {
    sbarNativeScrollbarWidth: number | undefined;
  }
}

export function getNativeScrollbarWidth(scrollable: HTMLDivElement): number {
  if (typeof window.sbarNativeScrollbarWidth !== 'undefined') {
    return window.sbarNativeScrollbarWidth;
  }

  try {
    if (
      ('getComputedStyle' in window &&
        window.getComputedStyle(scrollable, '::-webkit-scrollbar').display ===
          'none') ||
      'scrollbarWidth' in document.documentElement.style ||
      '-ms-overflow-style' in document.documentElement.style
    ) {
      window.sbarNativeScrollbarWidth = 0;
      return window.sbarNativeScrollbarWidth;
    }
  } catch {
    // nothing
  }

  const body = document.body;
  const testDiv = document.createElement('div');

  testDiv.style.position = 'fixed';
  testDiv.style.left = '0';
  testDiv.style.visibility = 'hidden';
  testDiv.style.overflowY = 'scroll';

  body.appendChild(testDiv);
  const width = testDiv.getBoundingClientRect().right;
  body.removeChild(testDiv);

  window.sbarNativeScrollbarWidth = width;
  return window.sbarNativeScrollbarWidth;
}
