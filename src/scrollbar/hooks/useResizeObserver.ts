import { useCallback, useEffect, useRef } from 'react';

export type ResizeContainerCallback = (entries: ResizeObserverEntry[]) => void;
export type ResizeTargetCallback = (entry: ResizeObserverEntry) => void;
export type ResizeObserveFn = (
  observeTarget: HTMLElement,
  targetCallback?: ResizeTargetCallback,
) => () => void;

export function useResizeObserver(
  containerCallback?: ResizeContainerCallback,
): { observe: ResizeObserveFn } {
  const $resizeObserver = useRef<ResizeObserver>();
  const $targetCallbacks = useRef<Map<Element, ResizeTargetCallback>>(
    new Map(),
  );

  const $containerCallback = useRef<ResizeContainerCallback>();
  $containerCallback.current = containerCallback;

  const startObserver = useCallback(() => {
    const entriesBuffer = new Map<Element, ResizeObserverEntry>();

    const bufferedCallback = () => {
      const entries = Array.from(entriesBuffer.values());

      entries.forEach((entry: ResizeObserverEntry) => {
        const targetCallback = $targetCallbacks.current.get(entry.target);
        if (targetCallback) {
          targetCallback(entry);
        }
      });

      if ($containerCallback.current) {
        $containerCallback.current(entries);
      }

      entriesBuffer.clear();
    };

    $resizeObserver.current = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        entriesBuffer.set(entry.target, entry);
      });

      bufferedCallback();
    });
  }, []);

  useEffect(() => {
    startObserver();

    return () => {
      if ($resizeObserver.current) {
        $resizeObserver.current.disconnect();
        $resizeObserver.current = undefined;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      $targetCallbacks.current.clear();
    };
  }, [startObserver]);

  const observe = useCallback<ResizeObserveFn>(
    (target, targetCallback) => {
      if (!$resizeObserver.current) {
        startObserver();
      }

      const observer = $resizeObserver.current!;
      const targetCallbacks = $targetCallbacks.current;

      observer.observe(target);

      if (targetCallback) {
        targetCallbacks.set(target, targetCallback);
      }

      return () => {
        if (targetCallback) {
          targetCallbacks.delete(target);
        }

        observer.unobserve(target);
      };
    },
    [$resizeObserver, startObserver],
  );

  return { observe };
}
