import { CSSProperties, forwardRef, HTMLAttributes, memo } from 'react';

type Props = HTMLAttributes<HTMLDivElement>;

export const Cropped = memo(
  forwardRef<HTMLDivElement, Props>(
    ({ children, style = {}, ...props }, ref) => {
      return (
        <div
          ref={ref}
          style={{ ...styles, ...style }}
          {...props}
          data-scrollbar="cropped"
        >
          {children}
        </div>
      );
    },
  ),
);

Cropped.displayName = 'Cropped';

const styles: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
};
