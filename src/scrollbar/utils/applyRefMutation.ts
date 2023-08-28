import { MutableRefObject } from 'react';

export function applyRefValueMutation(
  ref:
    | MutableRefObject<HTMLDivElement | null>
    | ((node: HTMLDivElement | null) => void)
    | undefined
    | null,
  value: HTMLDivElement | null,
): void {
  if (!ref) {
    return;
  }

  if (typeof ref === 'function') {
    ref(value);
  } else {
    ref.current = value;
  }
}
