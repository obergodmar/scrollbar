# Scrollbar

- [Options](#options)
- [Props](#props)
- [Usage](#usage)
- [Credits](#credits)

A small React library that replaces the SimpleBar functionality

The SimpleBar functionality has been rewritten with great emphasis on the functionality and features provided by React

- The number of wrappers has been changed - there are 6 of them in SimpleBar (not counting placeholders and trackbars). There are only 3 of them in this library
- Redesigned the redrawing mechanism - reduced the number of browser reflows
- The native bar is hidden without using an absolutely positioned element
- Scrollbar does not have a built-in instance for state management; instead, it provides the ability to interact directly through refs or styles, depending on the task.

### Scrollbar is

- Cropped: A layer that cuts off the native scrollbar, if there're any. It has the size of the parent element.
- Scrollable: A layer that has the Cropped size, but at the same time has a scroll.
- Content: A layer containing all the children's content (if it is passed as ReactNode) and having a content size (min-content).
- Two Thumb Track elements in each, which appear when scrolling is necessary.

## Options

```typescript
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
```

### Props

```typescript
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

export type Props = Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'children' | 'ref'> & {
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
```

### Usage

Check out the file [src/index.tsx](src/index.tsx). It contains examples of common usage.

Children as ReactNode

```js
<ScrollbarProvider forceVisible="y">
  <ScrollableContent />
</ScrollbarProvider>
```

Children as RenderFunc

```js
<ScrollbarProvider forceVisible="y">
  {({ scrollableRef, scrollableProps, contentRef, contentProps }) => (
    <div ref={scrollableRef} {...scrollableProps}>
      <div ref={contentRef} {...contentProps}>
        <ScrollableContent />
      </div>
    </div>
  )}
</ScrollbarProvider>
```

### Credits

- [simplebar](https://github.com/Grsmto/simplebar) for inspiration and core logic
