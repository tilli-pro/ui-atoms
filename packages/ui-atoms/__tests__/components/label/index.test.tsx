import { describe, expect, it } from "vitest";
import {
  Label,
  LabelPrimitive,
  labelVariants,
} from "../../../src/components/label/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

describe("Label (was generic-label — LBL-1)", () => {
  it("styled label carries the slot and the coss base's classes", () => {
    render(<Label>Name</Label>);
    const el = screen.getByText("Name");
    expectSlot(el, "label");
    expect(el.tagName).toBe("LABEL");
    expect(el.className).toContain("inline-flex items-center gap-2");
    expect(el.className).toContain("font-medium"); // v2's GenericLabel lacked it
    expect(el.className).toContain("text-base/4.5");
    expect(el.className).toContain("sm:text-sm/4");
  });
  it("render swaps the element (the gap LBL-1 closes); primitive is bare; variants exported", () => {
    render(
      <Label data-testid="s" render={<span />}>
        x
      </Label>,
    );
    const s = screen.getByTestId("s");
    expect(s.tagName).toBe("SPAN");
    expectSlot(s, "label");
    render(<LabelPrimitive data-testid="p" />);
    expect(screen.getByTestId("p").className).toBe("");
    expect(labelVariants()).toContain("font-medium");
  });
});
