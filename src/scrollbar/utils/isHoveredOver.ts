import { RefObject } from 'react';

export const isHoveredOver =
  ($ref: RefObject<HTMLDivElement>) => (clientX: number, clientY: number) => {
    const element = $ref.current;
    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();

    return (
      clientX >= rect.left &&
      clientX <= rect.left + rect.width &&
      clientY >= rect.top &&
      clientY <= rect.top + rect.height
    );
  };
