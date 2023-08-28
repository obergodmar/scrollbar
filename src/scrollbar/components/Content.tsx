import { forwardRef, HTMLAttributes, memo } from 'react';

type Props = HTMLAttributes<HTMLDivElement>;

export const Content = memo(
  forwardRef<HTMLDivElement, Props>(({ children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  }),
);

Content.displayName = 'Content';
