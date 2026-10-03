import { waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Menu,
  MenuItem,
  MenuLinkItem,
  MenuPopup,
  MenuSub,
  MenuSubPopup,
  MenuSubTrigger,
  MenuTrigger,
} from "../../../src/components/menu/index.js";
import { expectSlot, render, screen } from "../../helpers/render.js";

describe("Menu (coss base — MNU-2, MNU-3, MNU-6)", () => {
  it("MNU-3: MenuLinkItem renders a real anchor inside the popup", async () => {
    render(
      <Menu open={true}>
        <MenuTrigger>open</MenuTrigger>
        <MenuPopup>
          <MenuItem>Plain</MenuItem>
          <MenuLinkItem href="/x">Go</MenuLinkItem>
        </MenuPopup>
      </Menu>,
    );
    const link = await screen.findByText("Go");
    expectSlot(link, "menu-link-item");
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/x");
  });
  it("MNU-6: the submenu opens beside its trigger, not below it", async () => {
    render(
      <Menu open={true}>
        <MenuTrigger>open</MenuTrigger>
        <MenuPopup>
          <MenuSub open={true}>
            <MenuSubTrigger>More</MenuSubTrigger>
            <MenuSubPopup data-testid="sub">
              <MenuItem>Deep</MenuItem>
            </MenuSubPopup>
          </MenuSub>
        </MenuPopup>
      </Menu>,
    );
    const sub = await screen.findByTestId("sub");
    // MenuSubPopup passes data-slot="menu-sub-content" through MenuPopup's {...props},
    // so it wins over "menu-popup"; side/sideOffset land on the positioner above it.
    expectSlot(sub, "menu-sub-content");
    const positioner = sub.closest('[data-slot="menu-positioner"]');
    // Base UI 1.8.0 keeps the LOGICAL side on the attribute rather than mapping
    // it to a physical one, so the rendered value is "inline-end", not "right".
    // Either way it is not "bottom",
    // which was the bug: the submenu used to open below its trigger.
    await waitFor(() =>
      expect(positioner).toHaveAttribute("data-side", "inline-end"),
    );
  });
  it("MNU-2: className lands on the popup itself, not on a wrapper span", async () => {
    render(
      <Menu open={true}>
        <MenuTrigger>open</MenuTrigger>
        <MenuPopup className="w-64">x</MenuPopup>
      </Menu>,
    );
    const popup = await screen.findByRole("menu");
    expectSlot(popup, "menu-popup");
    expect(popup.className).toContain("w-64");
  });
});
