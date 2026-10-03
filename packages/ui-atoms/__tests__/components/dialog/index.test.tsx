import { describe, expect, it } from "vitest";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogHeaderPrimitive,
  DialogPanel,
  DialogPopup,
  DialogPopupPrimitive,
  DialogTitle,
  DialogTrigger,
  dialogBackdropVariants,
  dialogFooterVariants,
  dialogPopupVariants,
} from "../../../src/components/dialog/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

describe("Dialog family (coss base — DLG-1, DLG-2, DLG-3, DLG-5, DLG-6)", () => {
  it("open dialog renders backdrop, viewport, popup, sections and the close button", async () => {
    render(
      <Dialog open={true}>
        <DialogTrigger>open</DialogTrigger>
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Desc</DialogDescription>
          </DialogHeader>
          <DialogPanel>body</DialogPanel>
          <DialogFooter>
            <DialogClose>cancel</DialogClose>
          </DialogFooter>
        </DialogPopup>
      </Dialog>,
    );
    const popup = await screen.findByRole("dialog");
    expectSlot(popup, "dialog-popup");
    expect(popup.className).toContain("bg-popover");
    expect(
      document.querySelector('[data-slot="dialog-backdrop"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('[data-slot="dialog-viewport"]'),
    ).not.toBeNull();
    expectSlot(
      screen.getByText("body").closest('[data-slot="dialog-panel"]'),
      "dialog-panel",
    );
    expectSlot(screen.getByText("Title"), "dialog-title");
    expectSlot(screen.getByText("Desc"), "dialog-description");
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    expectSlot(screen.getByText("open"), "dialog-trigger");
  });
  it("DLG-6: the close control is a Button, so it carries the button slot", async () => {
    render(
      <Dialog open={true}>
        <DialogPopup>b</DialogPopup>
      </Dialog>,
    );
    await screen.findByRole("dialog");
    expectSlot(screen.getByRole("button", { name: "Close" }), "button");
  });
  it("DLG-5: closeProps reaches the close control and showCloseButton=false removes it", async () => {
    const { rerender } = render(
      <Dialog open={true}>
        <DialogPopup closeProps={{ "aria-label": "Dismiss" }}>b</DialogPopup>
      </Dialog>,
    );
    await screen.findByRole("dialog");
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
    rerender(
      <Dialog open={true}>
        <DialogPopupPrimitive showCloseButton={false}>b</DialogPopupPrimitive>
      </Dialog>,
    );
    const popup = await screen.findByRole("dialog");
    expect(popup.className).toBe("");
    expect(screen.queryByRole("button", { name: /Close|Dismiss/ })).toBeNull();
  });
  it("DLG-3: the default footer is the bordered muted bar; bare drops the border and pads instead", () => {
    // coss base: default = "border-t bg-muted/72 py-4";
    //            bare    = "in-[[data-slot=dialog-popup]:has([data-slot=dialog-panel])]:pt-3 pt-4 pb-6"
    const def = dialogFooterVariants();
    const bare = dialogFooterVariants({ variant: "bare" });
    expect(def).toContain("border-t");
    expect(def).toContain("bg-muted/72");
    expect(def).toContain("py-4");
    expect(def).not.toContain("pb-6");
    expect(bare).toContain("pb-6");
    expect(bare).toContain("pt-4");
    expect(bare).not.toContain("border-t");
    expect(bare).not.toContain("bg-muted/72");
    // shared base string, present under both variants
    expect(def).toContain("px-6");
    expect(bare).toContain("px-6");
  });
  it("DLG-4 is gone: no backdropClassName / closeButtonClassName on the popup props", () => {
    // Typecheck-only guard, as in the scroll-area suite above: inert under `vitest run`,
    // enforced by `pnpm --filter @tilli.dev/ui-atoms typecheck` as part of the gate.
    render(
      <Dialog open={true}>
        {/* @ts-expect-error both props were dropped with DLG-4; use closeProps / the Backdrop part. */}
        <DialogPopup backdropClassName="x" closeButtonClassName="y">
          b
        </DialogPopup>
      </Dialog>,
    );
  });
  it("structure-only header primitive is a bare div with its slot, and the variants export", () => {
    render(<DialogHeaderPrimitive data-testid="h" />);
    expect(screen.getByTestId("h").className).toBe("");
    expectSlot(screen.getByTestId("h"), "dialog-header");
    expect(dialogPopupVariants()).toContain("bg-popover");
    expect(dialogBackdropVariants()).toContain("fixed inset-0");
  });
});
