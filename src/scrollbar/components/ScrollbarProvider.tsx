import {
  DetailedHTMLProps,
  forwardRef,
  HTMLAttributes,
  memo,
  MouseEvent,
  MutableRefObject,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Content } from 'components/Content';
import { Cropped } from 'components/Cropped';
import { Scrollable } from 'components/Scrollable';
import {
  TracksAndThumbs,
  TracksAndThumbsRef,
} from 'components/TracksAndThumbs';
import {
  ResizeTargetCallback,
  useResizeObserver,
} from 'hooks/useResizeObserver';
import { Axis, ScrollbarOptions } from 'options';
import { applyContentStyles } from 'utils/applyContentStyles';
import { applyRefValueMutation } from 'utils/applyRefMutation';
import { applyScrollableStyles } from 'utils/applyScrollableStyles';
import { calculateThumbStyles } from 'utils/calculateThumbStyles';
import { getNativeScrollbarWidth } from 'utils/getNativeScrollbarWidth';

type RefObjectType = MutableRefObject<HTMLDivElement | null>;
type RefFuncType = (node: HTMLDivElement | null) => void;
type RefUnionType = RefObjectType | RefFuncType;

/**
 * Props for the 1st Cropped layer as well as for Scrollable and Content ones
 */
type PropsWithRef<RefType> = HTMLAttributes<HTMLDivElement> & {
  ref?: RefType;
};

type RenderFunc = (props: {
  /**
   * Ref for the Scrollable element (layer 2)
   */
  scrollableRef: RefObjectType;
  /**
   * Props for the Scrollable element (layer 2)
   */
  scrollableProps: PropsWithRef<RefUnionType>;
  /**
   * Ref for the Content element (layer 3)
   */
  contentRef: RefObjectType;
  /**
   * Props for the Content element (layer 3)
   */
  contentProps: PropsWithRef<RefUnionType>;
}) => ReactNode;

export type Props = Omit<
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  'children' | 'ref'
> & {
  /**
   * Props for the Scrollable element (layer 2)
   */
  scrollableProps?: PropsWithRef<RefUnionType>;
  /**
   * Props for the Content element (layer 3)
   */
  contentProps?: PropsWithRef<RefUnionType>;
  /**
   * children can be either ReactNode or RenderFunc
   *
   * In the 1st case, the Scrollable and Content layers will be created
   * In the 2nd case, the arguments in RenderFunc will provide
   * 4 entities to create the described layers via refs
   * or through props.
   */
  children: ReactNode | RenderFunc;
} & ScrollbarOptions;

export const ScrollbarProvider = memo(
  forwardRef<HTMLDivElement, Props>(
    (
      {
        children,
        scrollableProps,
        contentProps,
        overflowX,
        overflowY,
        forceVisible,
        minBarSize = 25,
        maxBarSize = 0,
        clickOnTrack = true,
        ...croppedProps
      },
      croppedForwardedRef,
    ) => {
      const $optionsRef = useRef({
        overflowX,
        overflowY,
        forceVisible,
        minBarSize,
        maxBarSize,
        clickOnTrack,
      });
      $optionsRef.current = {
        overflowX,
        overflowY,
        forceVisible,
        minBarSize,
        maxBarSize,
        clickOnTrack,
      };

      const $croppedRef = useRef<HTMLDivElement | null>(null);

      const [nativeBarSize, setNativeBarSize] = useState(0);

      const [xTrackNeeded, setXTrackNeeded] = useState(true);
      const [yTrackNeeded, setYTrackNeeded] = useState(true);

      const $tracksAndThumbs = useRef<TracksAndThumbsRef>(null);

      const $containerSizesRef = useRef({
        content: {
          width: 0,
          height: 0,
          scrollWidth: 0,
          scrollHeight: 0,
        },
        cropped: {
          width: 0,
          height: 0,
          offsetWidth: 0,
          offsetHeight: 0,
        },
        scrollable: {
          scrollLeft: 0,
          scrollTop: 0,
        },
      });

      const $recalculate = useRef(() => {
        const { content, cropped, scrollable } = $containerSizesRef.current;
        const { minBarSize, maxBarSize, overflowX, overflowY } =
          $optionsRef.current;
        const sizes = {
          min: minBarSize,
          max: maxBarSize,
        };

        if (overflowX !== 'hidden') {
          const { size: barWidth, position: x } = calculateThumbStyles(
            scrollable.scrollLeft,
            cropped.width,
            content.width,
            sizes,
          );

          setXTrackNeeded(
            content.scrollWidth > cropped.offsetWidth &&
              barWidth < cropped.offsetWidth,
          );

          $tracksAndThumbs.current?.x?.thumb?.setWidth?.(barWidth);
          $tracksAndThumbs.current?.x?.thumb?.setX?.(x);
        }

        if (overflowY !== 'hidden') {
          const { size: barHeight, position: y } = calculateThumbStyles(
            scrollable.scrollTop,
            cropped.height,
            content.height,
            sizes,
          );

          setYTrackNeeded(
            content.scrollHeight > cropped.offsetHeight &&
              barHeight < cropped.offsetHeight,
          );

          $tracksAndThumbs.current?.y?.thumb?.setHeight?.(barHeight);
          $tracksAndThumbs.current?.y?.thumb?.setY?.(y);
        }
      });

      const onScroll = useCallback((event: Event) => {
        if (event.target instanceof HTMLDivElement) {
          const { scrollTop, scrollLeft } = event.target;
          Object.assign($containerSizesRef.current.scrollable, {
            scrollLeft,
            scrollTop,
          });

          $recalculate.current();
        }
      }, []);

      const onMouseDown = useCallback(
        (axis: Axis, event: MouseEvent<HTMLDivElement>) => {
          const { track, thumb } = $tracksAndThumbs.current?.[axis] || {};

          if (
            !(event.target instanceof Node) ||
            !$scrollableRef.current?.contains(event.target)
          ) {
            return;
          }

          if (track?.isHoveredOver?.(event.clientX, event.clientY)) {
            event.preventDefault();

            if (thumb?.isHoveredOver?.(event.clientX, event.clientY)) {
              thumb?.onDragStart?.(event.clientX, event.clientY);
            } else {
              track?.onTrackClick(event.clientX, event.clientY);
            }
          }
        },
        [],
      );

      const $scrollableRef = useRef<HTMLDivElement | null>(null);
      const $scrollablePropsWithRef = useMemo<HTMLAttributes<HTMLDivElement>>(
        () => ({
          ...scrollableProps,
          onMouseDown: (event: MouseEvent<HTMLDivElement>) => {
            scrollableProps?.onMouseDown?.(event);

            onMouseDown('x', event);
            onMouseDown('y', event);
          },

          style: {
            ...applyScrollableStyles(nativeBarSize, { overflowY, overflowX }),
            ...scrollableProps?.style,
          },
          ref: (node: HTMLDivElement) => {
            $scrollableRef.current = node;
            applyRefValueMutation(scrollableProps?.ref, node);

            setNativeBarSize(getNativeScrollbarWidth(node));
          },
        }),
        [nativeBarSize, onMouseDown, overflowX, overflowY, scrollableProps],
      );

      const $contentRef = useRef<HTMLDivElement | null>(null);
      const $contentPropsWithRef = useMemo(
        () => ({
          ...contentProps,
          style: {
            ...applyContentStyles({ overflowX, overflowY }),
            ...contentProps?.style,
          },
          ref: (node: HTMLDivElement | null) => {
            $contentRef.current = node;
            applyRefValueMutation(contentProps?.ref, node);
          },
        }),
        [contentProps, overflowX, overflowY],
      );

      const { observe } = useResizeObserver();
      const onContainerResize = useCallback(
        (type: 'cropped' | 'content'): ResizeTargetCallback =>
          (entry) => {
            if (!entry) {
              return;
            }
            const { height, width } = entry.contentRect;

            if (type === 'cropped') {
              Object.assign($containerSizesRef.current.cropped, {
                width,
                height,
              });

              if (entry.target instanceof HTMLElement) {
                const { offsetHeight, offsetWidth } = entry.target;
                Object.assign($containerSizesRef.current.cropped, {
                  offsetWidth,
                  offsetHeight,
                });
              }
            }

            if (type === 'content') {
              Object.assign($containerSizesRef.current.content, {
                width,
                height,
              });

              if (entry.target instanceof HTMLElement) {
                const { scrollWidth, scrollHeight } = entry.target;
                Object.assign($containerSizesRef.current.content, {
                  scrollWidth,
                  scrollHeight,
                });
              }
            }

            $recalculate.current();
          },
        [],
      );

      useEffect(() => {
        const croppedElement = $croppedRef.current;
        if (!croppedElement) {
          return;
        }

        return observe(croppedElement, onContainerResize('cropped'));
      }, [onContainerResize, observe]);

      useEffect(() => {
        const contentElement = $contentRef.current;
        if (!contentElement) {
          return;
        }

        return observe(contentElement, onContainerResize('content'));
      }, [onContainerResize, observe]);

      const $dispatchRaf = useRef<number | null>(null);
      const dispatchScrollAction = useCallback(
        (dispatch: (element: HTMLDivElement) => void) => {
          if ($dispatchRaf.current) {
            return;
          }

          $dispatchRaf.current = window.requestAnimationFrame(() => {
            if ($scrollableRef.current) {
              dispatch($scrollableRef.current);
            }

            $dispatchRaf.current = null;
          });
        },
        [$scrollableRef],
      );

      useEffect(
        () => () => {
          if ($dispatchRaf.current) {
            window.cancelAnimationFrame($dispatchRaf.current);
          }
        },
        [],
      );

      useEffect(() => {
        const scrollable = $scrollableRef.current;
        if (!scrollable) {
          return;
        }

        scrollable.setAttribute('data-scrollbar', 'scrollable');
        scrollable.addEventListener('scroll', onScroll, { passive: true });

        const { scrollTop, scrollLeft } = scrollable;
        Object.assign($containerSizesRef.current.scrollable, {
          scrollLeft,
          scrollTop,
        });

        return () => {
          /**
           * Only the capture setting matters to removeEventListener().
           * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener
           */
          scrollable.removeEventListener('scroll', onScroll);
        };
      }, [onScroll]);

      useEffect(() => {
        const content = $contentRef.current;
        if (!content) {
          return;
        }

        content.setAttribute('data-scrollbar', 'content');
      }, []);

      return (
        <Cropped
          {...croppedProps}
          ref={(node) => {
            $croppedRef.current = node;
            applyRefValueMutation(croppedForwardedRef, node);
          }}
        >
          {typeof children === 'function' ? (
            children({
              contentRef: $contentRef,
              contentProps: $contentPropsWithRef,
              scrollableRef: $scrollableRef,
              scrollableProps: $scrollablePropsWithRef,
            })
          ) : (
            <Scrollable {...$scrollablePropsWithRef}>
              <Content {...$contentPropsWithRef}>{children}</Content>
            </Scrollable>
          )}

          <TracksAndThumbs
            ref={$tracksAndThumbs}
            overflowX={overflowX}
            overflowY={overflowY}
            forceVisible={forceVisible}
            xTrackNeeded={xTrackNeeded}
            yTrackNeeded={yTrackNeeded}
            clickOnTrack={clickOnTrack}
            dispatchScrollAction={dispatchScrollAction}
          />
        </Cropped>
      );
    },
  ),
);

ScrollbarProvider.displayName = 'ScrollbarProvider';
