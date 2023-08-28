import {
  Dispatch,
  forwardRef,
  MouseEvent as ReactMouseEvent,
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

export type YThumbMethods = {
  setHeight: Dispatch<SetStateAction<number>>;
  setY: Dispatch<SetStateAction<number>>;
};

export type XThumbMethods = {
  setWidth: Dispatch<SetStateAction<number>>;
  setX: Dispatch<SetStateAction<number>>;
};

type Props = {
  axis: Axis;
  dispatchScrollAction: (action: (element: HTMLDivElement) => void) => void;
};

type WithRef<Type> = Type & { ref: RefObject<HTMLDivElement | null> };

export type XThumb = WithRef<XThumbMethods>;
export type YThumb = WithRef<YThumbMethods>;

export const Thumb = forwardRef<XThumb | YThumb, Props>(
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

    useImperativeHandle(
      $thumb,
      () => ({
        ...(axis === 'x'
          ? {
              setX,
              setWidth,
            }
          : {
              setHeight,
              setY,
            }),
        ref: $thumbRef,
      }),
      [axis],
    );

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
      (event: ReactMouseEvent<HTMLDivElement>) => {
        const thumb = $thumbRef.current;
        if (!thumb) {
          return;
        }

        event.stopPropagation();

        const { clientX, clientY } = event;
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

    return (
      <div
        ref={$thumbRef}
        onMouseDown={onDragStart}
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
        data-scrollbar="thumb"
      />
    );
  },
);

Thumb.displayName = 'Thumb';
