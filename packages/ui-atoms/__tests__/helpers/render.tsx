import type { ReactElement } from "react";
import { screen, render as tlRender } from "@testing-library/react";
import { expect } from "vitest";

export { screen };
export function render(ui: ReactElement) {
  return tlRender(ui);
}
/** Asserts the coss `data-slot` contract on an element. */
export function expectSlot(
  el: Element | null,
  slot: string,
): asserts el is HTMLElement {
  expect(el).not.toBeNull();
  expect((el as HTMLElement).getAttribute("data-slot")).toBe(slot);
}
