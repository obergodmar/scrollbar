export type Axis = 'x' | 'y';

export type ScrollbarOptions = {
  /**
   * Controls the scroll appearance on the X axis
   *
   * Default: not set
   */
  overflowX?: 'scroll' | 'hidden';
  /**
   * Controls the scroll appearance on the Y axis
   *
   * Default: not set
   */
  overflowY?: 'scroll' | 'hidden';
  /**
   * Enables for a specific axis (if you pass x or y) or
   * for each axis (if true), click on the track, triggering
   * scroll in this direction
   *
   * Default: true
   */
  clickOnTrack?: Axis | boolean;
  /**
   * Track and thumb are hidden after 1 second of no event
   * Scroll or hover.
   *
   * To disable it, it is enough to pass true to disable the behavior
   * for all axes or for a specific one by passing x or y.
   *
   * Default: false
   *
   */
  forceVisible?: Axis | boolean;
  /**
   * Minimum Thumb Height
   *
   * Default: 25
   */
  minBarSize?: number;
  /**
   * Maximum Thumb Height
   *
   * Default: not set
   */
  maxBarSize?: number;
};
