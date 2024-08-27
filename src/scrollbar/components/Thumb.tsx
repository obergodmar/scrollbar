import {
  Dispatch,
  forwardRef,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import './Thumb.css';
import { Axis } from 'options';
import { cx } from 'utils/cx';
import { isHoveredOver } from 'utils/isHoveredOver';

export type ThumbMethods = {
  setWidth: Dispatch<SetStateAction<number>>;
  setHeight: Dispatch<SetStateAction<number>>;
  setX: Dispatch<SetStateAction<number>>;
  setY: Dispatch<SetStateAction<number>>;
  onDragStart: (clientX: number, clientY: number) => void;
  isHoveredOver: (clientX: number, clientY: number) => void;
};

type Props = {
  axis: Axis;
  dispatchScrollAction: (action: (element: HTMLDivElement) => void) => void;
};

type WithRef<Type> = Type & { ref: RefObject<HTMLDivElement | null> };

export type ThumbRef = WithRef<ThumbMethods>;

export const Thumb = forwardRef<ThumbRef, Props>(
  ({ axis, dispatchScrollAction }, $thumb) => {
    const [height, setHeight] = useState(0);
    const [y, setY] = useState(0);

    const [width, setWidth] = useState(0);
    const [x, setX] = useState(0);

    const [dragging, setDragging] = useState(false);
    const [scrolling, setScrolling] = useState(false);

    const $thumbSize = useRef({ width, height });
    $thumbSize.current = { width, height };

    const $thumbRef = useRef<HTMLDivElement>(null);

    const $dragStart = useRef({ x: 0, y: 0 });

    const onDragMove = useCallback(
      (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        const { clientX, clientY } = event;

        dispatchScrollAction((element) => {
          const { width, height, left, top } = element.getBoundingClientRect();
          const trackSize = axis === 'x' ? width : height;
          const trackOffset = axis === 'x' ? left : top;
          const contentSize =
            element[axis === 'x' ? 'scrollWidth' : 'scrollHeight'];
          const thumbSize =
            $thumbSize.current[axis === 'x' ? 'width' : 'height'];

          const offset = axis === 'x' ? clientX : clientY;

          let position = offset - trackOffset - $dragStart.current[axis];
          const ratio = position / (trackSize - thumbSize);
          position = ratio * (contentSize - trackSize);

          element[axis === 'x' ? 'scrollLeft' : 'scrollTop'] = position;
        });
      },
      [axis, dispatchScrollAction],
    );

    const onDragStop = useCallback(() => {
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragStop);

      setDragging(false);
    }, [onDragMove]);

    const onDragStart = useCallback(
      (clientX: number, clientY: number) => {
        const thumb = $thumbRef.current;
        if (!thumb) {
          return;
        }

        const { left, top } = thumb.getBoundingClientRect();

        $dragStart.current[axis] =
          axis === 'x' ? clientX - left : clientY - top;

        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragStop);

        setDragging(true);
      },
      [axis, onDragMove, onDragStop],
    );

    useEffect(() => onDragStop, [onDragStop]);

    useEffect(() => {
      const timer = window.setTimeout(() => {
        setScrolling(false);
      }, 1000);

      setScrolling(true);
      return () => {
        window.clearTimeout(timer);
      };
    }, [x, y]);

    useImperativeHandle(
      $thumb,
      () => ({
        setX,
        setWidth,
        setHeight,
        setY,
        onDragStart,
        isHoveredOver: isHoveredOver($thumbRef),
        ref: $thumbRef,
      }),
      [onDragStart],
    );

    return (
      <div
        ref={$thumbRef}
        data-scrollbar={`thumb thumb${axis.toUpperCase()}`}
        style={{
          position: 'absolute',
          ...(axis === 'x'
            ? {
                width,
                left: 0,
                bottom: 0,
                transform: `translate3d(${x}px, 0px, 0)`,
              }
            : {
                height,
                top: 0,
                right: 0,
                transform: `translate3d(0, ${y}px, 0)`,
              }),
        }}
        className={cx(
          `sbarThumb sbarThumb${axis.toUpperCase()}`,
          dragging && 'sbarThumb--dragging',
          scrolling && 'sbarThumb--scrolling',
        )}
      />
    );
  },
);

Thumb.displayName = 'Thumb';
