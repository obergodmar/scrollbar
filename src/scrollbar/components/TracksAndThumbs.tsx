import { forwardRef, memo, useImperativeHandle, useRef } from 'react';

import { TrackWithThumb, TrackWithThumbRef } from 'components/TrackWithThumb';
import { ScrollbarOptions } from 'options';

type Props = ScrollbarOptions & {
  xTrackNeeded: boolean;
  yTrackNeeded: boolean;
  dispatchScrollAction: (action: (element: HTMLDivElement) => void) => void;
};

export type TracksAndThumbsRef = {
  x: TrackWithThumbRef | null;
  y: TrackWithThumbRef | null;
};

export const TracksAndThumbs = memo(
  forwardRef<TracksAndThumbsRef, Props>(
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
      $tracksAndThumbsRef,
    ) => {
      const $xTrackWithThumb = useRef<TrackWithThumbRef>(null);
      const $yTrackWithThumb = useRef<TrackWithThumbRef>(null);

      useImperativeHandle(
        $tracksAndThumbsRef,
        () => ({
          x: $xTrackWithThumb.current,
          y: $yTrackWithThumb.current,
        }),
        // Необходимо для корректного восстановления рефов
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [xTrackNeeded, yTrackNeeded, overflowX, overflowY],
      );

      return (
        <>
          {overflowX !== 'hidden' && xTrackNeeded && (
            <TrackWithThumb
              ref={$xTrackWithThumb}
              axis="x"
              dispatchScrollAction={dispatchScrollAction}
              clickOnTrack={clickOnTrack}
              forceVisible={forceVisible}
            />
          )}

          {overflowY !== 'hidden' && yTrackNeeded && (
            <TrackWithThumb
              ref={$yTrackWithThumb}
              axis="y"
              dispatchScrollAction={dispatchScrollAction}
              clickOnTrack={clickOnTrack}
              forceVisible={forceVisible}
            />
          )}
        </>
      );
    },
  ),
);

TracksAndThumbs.displayName = 'TracksAndThumbs';
