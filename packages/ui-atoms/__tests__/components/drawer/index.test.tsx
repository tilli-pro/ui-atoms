import { describe, expect, it } from "vitest";
import {
  Drawer,
  DrawerPopup,
  DrawerTitle,
  DrawerTrigger,
} from "../../../src/components/drawer/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

// Dependency swap: `vaul` → `@base-ui/react/drawer`. `DrawerPopup` composes
// Portal → Backdrop → Viewport → Popup, so one render exercises the whole
// chain of parts this file re-ported.
describe("Drawer (@base-ui/react/drawer swap)", () => {
  it("renders the portal chain and the coss data-slots when open", () => {
    render(
      <Drawer defaultOpen={true}>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerPopup showBar={true} showCloseButton={true}>
          <DrawerTitle>Filters</DrawerTitle>
        </DrawerPopup>
      </Drawer>,
    );
    expectSlot(screen.getByText("Open"), "drawer-trigger");
    for (const slot of [
      "drawer-backdrop",
      "drawer-viewport",
      "drawer-popup",
      "drawer-title",
      "drawer-bar",
    ])
      expect(document.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
    expect(screen.getByLabelText("Close")).toBeTruthy();
  });

  it("defaults to the bottom position and passes it to the popup's classes", () => {
    render(
      <Drawer defaultOpen={true}>
        <DrawerPopup>
          <DrawerTitle>Filters</DrawerTitle>
        </DrawerPopup>
      </Drawer>,
    );
    const popup = document.querySelector('[data-slot="drawer-popup"]');
    // The bottom popup's corner and origin classes, verbatim from `.coss-base/drawer.tsx`.
    expect(popup?.className).toContain("rounded-t-2xl");
    expect(popup?.className).toContain("origin-[50%_calc(100%-var(--inset))]");
  });
});
