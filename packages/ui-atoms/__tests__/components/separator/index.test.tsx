import { describe, expect, it } from "vitest";
import {
  Separator,
  SeparatorPrimitive,
  separatorVariants,
} from "../../../src/components/separator/index.js";
import { expectSlot, render } from "../../helpers/render.js";

describe("Separator", () => {
  it("styled: horizontal by default with the v2 classes", () => {
    const { container } = render(<Separator />);
    const el = container.querySelector('[data-slot="separator"]');
    expectSlot(el, "separator");
    expect(el).toHaveAttribute("data-orientation", "horizontal");
    expect(el.className).toContain("bg-border");
  });
  it("styled: vertical orientation and className merge", () => {
    const { container } = render(
      <Separator className="mx-2" orientation="vertical" />,
    );
    const el = container.querySelector(
      '[data-slot="separator"]',
    ) as HTMLElement;
    expect(el).toHaveAttribute("data-orientation", "vertical");
    expect(el.className).toContain("mx-2");
  });
  it("primitive has no classes; variants export the base", () => {
    const { container } = render(<SeparatorPrimitive />);
    expect(
      (container.querySelector('[data-slot="separator"]') as HTMLElement)
        .className,
    ).toBe("");
    expect(separatorVariants()).toContain("shrink-0 bg-border");
  });
});
