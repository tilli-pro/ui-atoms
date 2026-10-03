import { describe, expect, it } from "vitest";
import { Slider } from "../../../src/components/slider/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

describe("Slider (coss base, SLD-1/SLD-2)", () => {
  it("renders control/track/indicator/thumb with the coss data-slots", () => {
    render(<Slider aria-label="Value" defaultValue={[50]} />);
    expectSlot(
      document.querySelector("[data-slot=slider-control]"),
      "slider-control",
    );
    expectSlot(
      document.querySelector("[data-slot=slider-track]"),
      "slider-track",
    );
    expectSlot(
      document.querySelector("[data-slot=slider-indicator]"),
      "slider-indicator",
    );
    expectSlot(
      document.querySelector("[data-slot=slider-thumb]"),
      "slider-thumb",
    );
  });
  it("a11y: aria-label reaches the thumb input, not just the root — the input[type=range] is what axe's label rule checks", () => {
    render(<Slider aria-label="Volume" defaultValue={[50]} />);
    const thumb = screen.getByRole("slider", { hidden: true });
    expect(thumb.getAttribute("aria-label")).toBe("Volume");
  });
  it("a11y: getAriaLabel gives each thumb of a multi-thumb slider a distinct name", () => {
    render(
      <Slider
        defaultValue={[20, 80]}
        getAriaLabel={(index) =>
          index === 0 ? "Minimum price" : "Maximum price"
        }
      />,
    );
    const thumbs = screen.getAllByRole("slider", { hidden: true });
    expect(thumbs).toHaveLength(2);
    expect(thumbs[0]?.getAttribute("aria-label")).toBe("Minimum price");
    expect(thumbs[1]?.getAttribute("aria-label")).toBe("Maximum price");
  });
});
