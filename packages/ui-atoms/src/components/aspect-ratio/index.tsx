"use client";

import type * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

// ASP-1: re-authored on base-ui `useRender`. No vendored Radix survives
// in this package and coss ships no counterpart, so there is no base to take.

export interface AspectRatioProps extends useRender.ComponentProps<"div"> {
  ratio?: number;
}

/** Padding-bottom ratio box; the inner element (or `render`) fills it absolutely. */
function AspectRatio({
  ratio = 1 / 1,
  style,
  render,
  ...props
}: AspectRatioProps) {
  // Hoisted so the object is not a fresh literal at the call site: `data-slot`
  // is a valid DOM attribute but not a member of React's prop types, and an
  // inline literal would trip TypeScript's excess-property check.
  const defaultProps = {
    "data-slot": "aspect-ratio",
    style: {
      ...style,
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    } as React.CSSProperties,
  };

  const inner = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render,
  });

  return (
    <div
      data-slot="aspect-ratio-wrapper"
      style={{
        position: "relative",
        width: "100%",
        paddingBottom: `${100 / ratio}%`,
      }}
    >
      {inner}
    </div>
  );
}

export { AspectRatio };
