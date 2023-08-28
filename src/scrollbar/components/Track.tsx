import {
  CSSProperties,
  forwardRef,
  memo,
  MouseEvent,
  useCallback,
  useImperativeHandle,
  useRef,
  WheelEvent,
} from 'react';

import './Track.css';
import {
  Thumb,
  XThumb,
  XThumbMethods,
  YThumb,
  YThumbMethods,
} from 'components/Thumb';
import { Axis, ScrollbarOptions } from 'options';
import { cx } from 'utils/cx';

type Props = ScrollbarOptions & {
  xTrackNeeded: boolean;
  yTrackNeeded: boolean;
  dispatchScrollAction: (action: (element: HTMLDivElement) => void) => void;
};

export const Track = memo(
  forwardRef<Partial<YThumbMethods & XThumbMethods>, Props>(
    (
      {
        overflowY,
        overflowX,
        forceVisible,
        xTrackNeeded,
        yTrackNeeded,
        clickOnTrack,
        dispatchScrollAction,
      },
      $thumbMethods,
    ) => {
      const $xThumb = useRef<XThumb>(null);
      const $yThumb = useRef<YThumb>(null);

      useImperativeHandle(
        $thumbMethods,
        () => ({
          setX: $xThumb.current?.setX,
          setWidth: $xThumb.current?.setWidth,
          setY: $yThumb.current?.setY,
          setHeight: $yThumb.current?.setHeight,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [xTrackNeeded, yTrackNeeded, overflowX, overflowY],
      );

      const onTrackClick = useCallback(
        (axis: Axis) => (event: MouseEvent<HTMLDivElement>) => {
          if (
            !clickOnTrack ||
            (typeof clickOnTrack === 'string' && clickOnTrack !== axis)
          ) {
            return;
          }

          const { clientX, clientY, target } = event;
          const thumb = (axis === 'x' ? $xThumb : $yThumb).current?.ref.current;

          if (!thumb || !(target instanceof HTMLElement)) {
            return;
          }

          event.preventDefault();

          dispatchScrollAction((scrollableElement) => {
            const { scrollLeft, scrollTop } = scrollableElement;
            const { width, height } = scrollableElement.getBoundingClientRect();
            const { left, top } = thumb.getBoundingClientRect();

            const size = axis === 'x' ? width : height;
            const offset = axis === 'x' ? left : top;
            const spot = axis === 'x' ? clientX : clientY;

            const scrollState = axis === 'x' ? scrollLeft : scrollTop;
            const direction = Math.sign(spot - offset);

            const scrollSize = scrollState + size * direction;

            const scrollToOptions =
              axis === 'x' ? { left: scrollSize } : { top: scrollSize };

            scrollableElement.scrollTo({
              ...scrollToOptions,
              behavior: 'auto',
            });
          });
        },
        [clickOnTrack, dispatchScrollAction],
      );

      const onTrackWheel = useCallback(
        (axis: Axis) => (event: WheelEvent<HTMLDivElement>) => {
          const { deltaX, deltaY } = event;
          const delta = axis === 'x' ? deltaX : deltaY;

          dispatchScrollAction((element) => {
            element[axis === 'x' ? 'scrollLeft' : 'scrollTop'] += delta;
          });
        },
        [dispatchScrollAction],
      );

      return (
        <>
          {overflowX !== 'hidden' && xTrackNeeded && (
            <div
              data-scrollbar="track"
              onMouseDown={onTrackClick('x')}
              onWheel={onTrackWheel('x')}
              className={cx(
                'sbarTrack sbarTrackX',
                applyVisibility('x', forceVisible),
              )}
              style={applyStyles('x')}
            >
              <Thumb
                axis="x"
                ref={$xThumb}
                dispatchScrollAction={dispatchScrollAction}
              />
            </div>
          )}

          {overflowY !== 'hidden' && yTrackNeeded && (
            <div
              data-scrollbar="track"
              onMouseDown={onTrackClick('y')}
              onWheel={onTrackWheel('y')}
              className={cx(
                'sbarTrack sbarTrackY',
                applyVisibility('y', forceVisible),
              )}
              style={applyStyles('y')}
            >
              <Thumb
                axis="y"
                ref={$yThumb}
                dispatchScrollAction={dispatchScrollAction}
              />
            </div>
          )}
        </>
      );
    },
  ),
);

Track.displayName = 'Track';

function applyStyles(axis: Axis): CSSProperties {
  return {
    position: 'absolute',
    ...(axis === 'x'
      ? {
          left: 0,
          bottom: 0,
          width: '100%',
          height: '11px',
        }
      : {
          top: 0,
          right: 0,
          width: '11px',
          height: '100%',
        }),
  };
}

function applyVisibility(
  axis: Axis,
  forceVisible: ScrollbarOptions['forceVisible'],
): string {
  if (!forceVisible) {
    return '';
  }

  if (typeof forceVisible === 'boolean' || forceVisible === axis) {
    return `sbarTrack${axis.toUpperCase()}--visible`;
  }

  return '';
}
