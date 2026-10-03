import { describe, expect, it } from "vitest";
import {
  Tooltip,
  TooltipPopup,
  TooltipPopupPrimitive,
  TooltipProvider,
  TooltipTrigger,
  tooltipPopupVariants,
} from "../../../src/components/tooltip/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

describe("Tooltip (coss base: Viewport, coss slot names, no arrow)", () => {
  it("renders trigger with its slot and an open popup with the styled classes", async () => {
    render(
      <TooltipProvider>
        <Tooltip open={true}>
          <TooltipTrigger>hover me</TooltipTrigger>
          <TooltipPopup>tip text</TooltipPopup>
        </Tooltip>
      </TooltipProvider>,
    );
    expectSlot(screen.getByText("hover me"), "tooltip-trigger");
    const viewport = (await screen.findByText("tip text")).closest(
      '[data-slot="tooltip-viewport"]',
    ) as HTMLElement;
    const popup = viewport.parentElement as HTMLElement;
    expectSlot(popup, "tooltip-popup");
    expect(popup.className).toContain("rounded-md");
    expect(popup.parentElement).toHaveAttribute(
      "data-slot",
      "tooltip-positioner",
    );
  });
  it("primitive carries no popup classes and TIP-1 is gone — no arrow, no withArrow prop", async () => {
    const { container } = render(
      <TooltipProvider>
        <Tooltip open={true}>
          <TooltipTrigger>t</TooltipTrigger>
          <TooltipPopupPrimitive>p</TooltipPopupPrimitive>
        </Tooltip>
      </TooltipProvider>,
    );
    const viewport = (await screen.findByText("p")).closest(
      '[data-slot="tooltip-viewport"]',
    ) as HTMLElement;
    expect((viewport.parentElement as HTMLElement).className).toBe("");
    expect(
      container.ownerDocument.querySelector('[data-slot="tooltip-arrow"]'),
    ).toBeNull();
  });
  it("TIP-3 is gone: the variants object takes no arguments and exports the popup base", () => {
    expect(tooltipPopupVariants()).toContain("bg-popover");
    expect(tooltipPopupVariants()).toContain("not-dark:bg-clip-padding");
  });
});
