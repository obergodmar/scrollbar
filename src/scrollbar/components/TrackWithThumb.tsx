import {
  forwardRef,
  RefObject,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';

import './TrackWithThumb.css';
import { Thumb, ThumbRef } from 'components/Thumb';
import { Axis, ScrollbarOptions } from 'options';
import { cx } from 'utils/cx';
import { isHoveredOver } from 'utils/isHoveredOver';

export type TrackMethods = {
  onTrackClick: (clientX: number, clientY: number) => void;
  isHoveredOver: (clientX: number, clientY: number) => void;
};

type Props = {
  axis: Axis;
  dispatchScrollAction: (action: (element: HTMLDivElement) => void) => void;
} & Pick<ScrollbarOptions, 'clickOnTrack' | 'forceVisible'>;

type WithRef<Type> = Type & { ref: RefObject<HTMLDivElement | null> };

export type TrackWithThumbRef = {
  thumb: ThumbRef | null;
  track: WithRef<TrackMethods>;
};

export const TrackWithThumb = forwardRef<TrackWithThumbRef, Props>(
  ({ axis, dispatchScrollAction, clickOnTrack, forceVisible }, $ref) => {
    const $trackRef = useRef<HTMLDivElement>(null);
    const $thumb = useRef<ThumbRef>(null);

    const onTrackClick = useCallback(
      (clientX: number, clientY: number) => {
        if (
          !clickOnTrack ||
          (typeof clickOnTrack === 'string' && clickOnTrack !== axis)
        ) {
          return;
        }

        const thumb = $thumb.current?.ref.current;
        if (!thumb) {
          return;
        }

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
      [axis, clickOnTrack, dispatchScrollAction],
    );

    useImperativeHandle(
      $ref,
      () => ({
        thumb: $thumb.current,
        track: {
          ref: $trackRef,
          onTrackClick,
          isHoveredOver: isHoveredOver($trackRef),
        },
      }),
      [onTrackClick],
    );

    return (
      <div
        ref={$trackRef}
        data-scrollbar={`track track${axis.toUpperCase()}`}
        className={cx(
          `sbarTrack sbarTrack${axis.toUpperCase()}`,
          applyVisibility(axis, forceVisible),
        )}
      >
        <Thumb
          ref={$thumb}
          axis={axis}
          dispatchScrollAction={dispatchScrollAction}
        />
      </div>
    );
  },
);

TrackWithThumb.displayName = 'TrackWithThumb';

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
