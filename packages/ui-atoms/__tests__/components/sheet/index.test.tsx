import { describe, expect, it } from "vitest";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
  sheetPopupVariants,
} from "../../../src/components/sheet/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

describe("Sheet (coss sheet.tsx @b2336c4)", () => {
  it("renders Portal → Backdrop → Viewport → Popup with header, panel and footer slots", async () => {
    render(
      <Sheet open={true}>
        <SheetPopup>
          <SheetHeader>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription>Description</SheetDescription>
          </SheetHeader>
          <SheetPanel>Body</SheetPanel>
          <SheetFooter>Footer</SheetFooter>
        </SheetPopup>
      </Sheet>,
    );
    const popup = await screen.findByRole("dialog");
    expectSlot(popup, "sheet-popup");
    expectSlot(popup.parentElement, "sheet-viewport");
    expect(
      document.querySelector('[data-slot="sheet-backdrop"]'),
    ).not.toBeNull();
    // The body part v2 lacked: padded, and inside a scroll area.
    const panel = screen.getByText("Body");
    expectSlot(panel, "sheet-panel");
    expect(panel.className).toContain("p-6");
    expect(panel.closest('[data-slot="scroll-area-viewport"]')).not.toBeNull();
    expectSlot(screen.getByText("Footer"), "sheet-footer");
    expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
  });

  it("keeps the v2 names: SheetContent is SheetPopup, and `side` still places it", () => {
    expect(SheetContent).toBe(SheetPopup);
    expect(sheetPopupVariants({ side: "left" })).toContain("border-e");
    expect(sheetPopupVariants({ side: "right" })).toContain("border-s");
    expect(sheetPopupVariants({ variant: "inset" })).toContain(
      "sm:rounded-2xl",
    );
  });
});
