import { describe, expect, it } from "vitest";
import {
  Checkbox,
  CheckboxPrimitive,
  checkboxIndicatorVariants,
  checkboxVariants,
} from "../../../src/components/checkbox/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

describe("Checkbox", () => {
  it("styled: root + indicator slots and classes", () => {
    render(<Checkbox aria-label="c" defaultChecked={true} />);
    const root = screen.getByRole("checkbox", { name: "c" });
    expectSlot(root, "checkbox");
    expect(root.className).toContain("size-4");
    const indicator = root.querySelector(
      '[data-slot="checkbox-indicator"]',
    ) as HTMLElement;
    expect(indicator).not.toBeNull();
    expect(indicator.className).toContain("data-checked:bg-primary");
    expect(indicator.querySelector("svg")).not.toBeNull();
  });
  it("primitive is bare but keeps the indicator structure; variants exported", () => {
    // Base UI unmounts Checkbox.Indicator while unchecked (keepMounted=false), so check it to assert the structure.
    render(<CheckboxPrimitive aria-label="p" defaultChecked={true} />);
    const root = screen.getByRole("checkbox", { name: "p" });
    expect(root.className).toBe("");
    expect(
      root.querySelector('[data-slot="checkbox-indicator"]'),
    ).not.toBeNull();
    expect(checkboxVariants()).toContain("rounded-[.25rem]"); // verbatim from the base — do not normalise the leading zero
    expect(checkboxIndicatorVariants()).toContain("data-unchecked:hidden");
  });
});
