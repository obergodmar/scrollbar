import { forwardRef, HTMLAttributes, memo } from 'react';

type Props = HTMLAttributes<HTMLDivElement>;

export const Scrollable = memo(
  forwardRef<HTMLDivElement, Props>(({ children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  }),
);

Scrollable.displayName = 'Scrollable';
